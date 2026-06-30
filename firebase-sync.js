const FIREBASE_SDK_VERSION = "10.12.5";
const CONFIG = window.IRIS_FIREBASE_CONFIG || {};
const SESSION_KEY = "irisMappingSession";
const USERS_KEY = "irisMappingUsers";
const EYE_MARKERS_KEY_PREFIX = "irisEyeMarkers";
const MAX_VALUE_BYTES = 850000;
const SYNC_DEBOUNCE_MS = 900;

const managedKeyPatterns = [
  /^iris/i,
  /^UniverseReportDB:/,
  /^previousIrisPhoto$/,
  /^member/i
];

const structuredKeys = {
  members: USERS_KEY,
  session: SESSION_KEY,
  irisResult: "irisReadingResult",
  cart: "irisShoppingCart",
  orders: "irisShoppingOrders",
  consultations: "irisShoppingConsultRequests",
  products: "irisProductDB",
  eyeMarkersPrefix: EYE_MARKERS_KEY_PREFIX
};

let firebaseReady = false;
let currentUser = null;
let auth;
let db;
let firebaseApi;
let syncTimer = null;
let applyingRemoteSnapshot = false;
let remoteSnapshotLoadedForUid = "";
let remoteSnapshotPromise = null;
let remoteSnapshotMeta = null;
let firestoreWriteUnlockedForUid = "";
let lastFirebaseError = null;
const debugEntries = [];

window.IrisFirebase = {
  ready: false,
  enabled: false,
  signInWithPhoneName,
  syncNow,
  testWrite,
  signOut,
  debug: () => debugEntries.slice(),
  lastError: () => lastFirebaseError,
  getCurrentUser: () => currentUser
};

if (hasFirebaseConfig(CONFIG)) {
  logStep("config:loaded", { projectId: CONFIG.projectId, authDomain: CONFIG.authDomain });
  bootFirebase().catch((error) => {
    logError("boot:error", error);
  });
} else {
  logStep("config:missing");
}

function hasFirebaseConfig(config) {
  return Boolean(config && config.apiKey && config.authDomain && config.projectId && config.appId);
}

async function bootFirebase() {
  logStep("sdk:import:start");
  const appModule = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`);
  const authModule = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-auth.js`);
  const firestoreModule = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`);
  logStep("sdk:import:done");

  const app = appModule.initializeApp(CONFIG);
  logStep("initializeApp:done", { appName: app.name });
  auth = authModule.getAuth(app);
  db = firestoreModule.getFirestore(app);
  logStep("getFirestore:done", { projectId: CONFIG.projectId });
  firebaseApi = { authModule, firestoreModule };
  firebaseReady = true;
  window.IrisFirebase.ready = true;
  window.IrisFirebase.enabled = true;

  patchLocalStorage();

  authModule.onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    logStep("auth:state", { uid: user?.uid || null, email: user?.email || null });
    if (user) console.info("[IRIS Firebase UID]", user.uid, "Firestore path:", `users/${user.uid}`);
    if (!user) return;
    try {
      await ensureRemoteSnapshotLoaded(user.uid);
      await maybeInitialUploadFromLocal(user.uid, "auth:state");
    } catch (error) {
      logError("auth:state:sync-error", error);
    }
  });

  const sessionPhone = normalizePhone(localStorage.getItem(SESSION_KEY));
  if (sessionPhone) {
    logStep("session:found", { phone: maskPhone(sessionPhone) });
    await signInFromLocalSession(sessionPhone).catch((error) => {
      logError("session:firebase-login-failed", error);
    });
  } else {
    logStep("session:not-found");
  }
}

function patchLocalStorage() {
  if (Storage.prototype.__irisFirebasePatched) return;
  const nativeSetItem = Storage.prototype.setItem;
  const nativeRemoveItem = Storage.prototype.removeItem;
  Storage.prototype.setItem = function patchedSetItem(key, value) {
    nativeSetItem.call(this, key, value);
    if (this === localStorage) handleStorageMutation(key);
  };
  Storage.prototype.removeItem = function patchedRemoveItem(key) {
    nativeRemoveItem.call(this, key);
    if (this === localStorage) handleStorageMutation(key);
  };
  Storage.prototype.__irisFirebasePatched = true;
}

function handleStorageMutation(key) {
  if (applyingRemoteSnapshot || !firebaseReady) return;
  if (key === SESSION_KEY) {
    const phone = normalizePhone(localStorage.getItem(SESSION_KEY));
    if (phone) {
      signInFromLocalSession(phone).catch((error) => {
        logError("session:firebase-login-failed", error);
      });
    }
    else signOut().catch(() => {});
    return;
  }
  if (!isManagedKey(key)) return;
  scheduleSync();
}

async function signInFromLocalSession(phone) {
  const users = readJson(USERS_KEY, {});
  const profile = users[phone] || { phone };
  await signInWithPhoneName(profile.name || "", phone, profile);
}

async function signInWithPhoneName(name, phone, profile = {}) {
  if (!firebaseReady) return null;
  const phoneKey = normalizePhone(phone);
  if (!phoneKey) return null;

  const email = `${phoneKey}@iris.local`;
  const password = createAccountPassword(phoneKey);
  const { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } = firebaseApi.authModule;

  try {
    logStep("auth:signIn:start", { email });
    const credential = await signInWithEmailAndPassword(auth, email, password);
    currentUser = credential.user;
    logStep("auth:signIn:done", { uid: currentUser.uid });
  } catch (error) {
    logError("auth:signIn:error", error);
    if (error?.code !== "auth/user-not-found" && error?.code !== "auth/invalid-credential") throw error;
    logStep("auth:create:start", { email });
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    currentUser = credential.user;
    logStep("auth:create:done", { uid: currentUser.uid });
  }

  if (name || profile.name) {
    await updateProfile(currentUser, { displayName: name || profile.name }).catch(() => {});
  }

  await ensureRemoteSnapshotLoaded(currentUser.uid);
  await maybeSaveMemberProfileFromLocal(currentUser.uid, phoneKey, { ...profile, name: name || profile.name || "", phone: profile.phone || phoneKey }, "auth:login");
  await maybeInitialUploadFromLocal(currentUser.uid, "auth:login");
  return currentUser;
}

async function signOut() {
  if (!firebaseReady) return;
  await firebaseApi.authModule.signOut(auth);
}

function createAccountPassword(phoneKey) {
  return `Iris@${phoneKey.length}${phoneKey.slice(-4)}Sync`;
}

function scheduleSync() {
  if (!currentUser) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => syncNow().catch((error) => console.warn("[IRIS Firebase] 동기화 실패:", error)), SYNC_DEBOUNCE_MS);
}

async function maybeInitialUploadFromLocal(uid, reason) {
  if (!firebaseReady || !currentUser || currentUser.uid !== uid) return;
  await ensureRemoteSnapshotLoaded(uid);

  if (hasRemoteSnapshotData(uid)) {
    firestoreWriteUnlockedForUid = uid;
    console.info("[IRIS Firebase upload blocked]", {
      uid,
      reason,
      firestoreHasData: true,
      message: "Firestore 데이터가 있어 localStorage 최초 업로드를 차단했습니다."
    });
    logStep("firestore:initial-upload:blocked", { uid, reason });
    return;
  }

  console.info("[IRIS Firebase initial upload]", {
    uid,
    reason,
    firestoreHasData: false,
    message: "Firestore가 비어 있어 localStorage를 최초 업로드합니다."
  });
  logStep("firestore:initial-upload:allowed", { uid, reason });
  await syncNowWithOptions({ allowBeforeUnlock: true, reason });
  firestoreWriteUnlockedForUid = uid;
}

async function syncNow() {
  return syncNowWithOptions({});
}

async function syncNowWithOptions(options = {}) {
  if (!firebaseReady || !currentUser) return;
  await ensureRemoteSnapshotLoaded(currentUser.uid);
  const uid = currentUser.uid;

  if (firestoreWriteUnlockedForUid !== uid && hasRemoteSnapshotData(uid) && !options.allowBeforeUnlock) {
    console.info("[IRIS Firebase upload blocked]", {
      uid,
      reason: options.reason || "syncNow",
      firestoreHasData: true,
      message: "Firestore 복원 전 localStorage 업로드를 차단했습니다."
    });
    logStep("firestore:write:blocked-before-unlock", { uid, reason: options.reason || "syncNow" });
    return;
  }

  const snapshot = collectLocalStorageSnapshot();
  const { doc, setDoc, serverTimestamp } = firebaseApi.firestoreModule;

  logStep("firestore:snapshot:write:start", { uid, keyCount: Object.keys(snapshot).length });
  await setDoc(doc(db, "users", uid, "sync", "localStorage"), {
    updatedAt: serverTimestamp(),
    keys: Object.keys(snapshot),
    data: snapshot
  }, { merge: true });
  logStep("firestore:snapshot:write:done", { uid });

  await syncStructuredDocs(uid, snapshot);
}

async function syncStructuredDocs(uid, snapshot) {
  const { doc, setDoc, serverTimestamp } = firebaseApi.firestoreModule;
  const phone = normalizePhone(snapshot[SESSION_KEY] || localStorage.getItem(SESSION_KEY));

  const profile = getCurrentProfile(phone, snapshot);
  if (profile) await saveMemberProfile(uid, phone, profile);

  logStep("firestore:structured:write:start", { uid });
  const eyeMarkers = collectEyeMarkersFromSnapshot(snapshot, phone);
  await setDoc(doc(db, "users", uid, "irisResults", "latest"), {
    updatedAt: serverTimestamp(),
    result: parseJsonValue(snapshot[structuredKeys.irisResult])
  }, { merge: true });

  await setDoc(doc(db, "users", uid, "irisMarkers", "latest"), {
    updatedAt: serverTimestamp(),
    storageKeys: eyeMarkers.storageKeys,
    leftEyeMarkers: eyeMarkers.left,
    rightEyeMarkers: eyeMarkers.right
  }, { merge: true });
  console.info("[IRIS Firebase markers]", {
    firestorePath: `users/${uid}/irisMarkers/latest`,
    leftEyeMarkersKey: eyeMarkers.storageKeys.left,
    rightEyeMarkersKey: eyeMarkers.storageKeys.right,
    leftCount: eyeMarkers.left.length,
    rightCount: eyeMarkers.right.length
  });

  await setDoc(doc(db, "users", uid, "cart", "current"), {
    updatedAt: serverTimestamp(),
    items: parseJsonValue(snapshot[structuredKeys.cart]) || []
  }, { merge: true });

  await setDoc(doc(db, "users", uid, "orders", "history"), {
    updatedAt: serverTimestamp(),
    items: parseJsonValue(snapshot[structuredKeys.orders]) || []
  }, { merge: true });

  await setDoc(doc(db, "users", uid, "consultations", "history"), {
    updatedAt: serverTimestamp(),
    items: parseJsonValue(snapshot[structuredKeys.consultations]) || []
  }, { merge: true });

  await setDoc(doc(db, "users", uid, "products", "operatorCatalog"), {
    updatedAt: serverTimestamp(),
    items: parseJsonValue(snapshot[structuredKeys.products]) || []
  }, { merge: true });
  logStep("firestore:structured:write:done", { uid });
}

function collectEyeMarkersFromSnapshot(snapshot, phone) {
  const owner = phone || normalizePhone(snapshot[SESSION_KEY] || "");
  const rightKey = owner ? `${EYE_MARKERS_KEY_PREFIX}:${owner}:right` : "";
  const leftKey = owner ? `${EYE_MARKERS_KEY_PREFIX}:${owner}:left` : "";
  return {
    storageKeys: {
      right: rightKey,
      left: leftKey
    },
    right: parseJsonValue(snapshot[rightKey]) || [],
    left: parseJsonValue(snapshot[leftKey]) || []
  };
}

async function ensureRemoteSnapshotLoaded(uid) {
  if (!uid) return;
  if (remoteSnapshotLoadedForUid === uid) return;
  if (!remoteSnapshotPromise) {
    remoteSnapshotPromise = loadRemoteSnapshot(uid).finally(() => {
      remoteSnapshotPromise = null;
    });
  }
  await remoteSnapshotPromise;
}

async function saveMemberProfile(uid, phone, profile) {
  if (!firebaseReady || !uid) return;
  const { doc, setDoc, serverTimestamp } = firebaseApi.firestoreModule;
  logStep("firestore:user:write:start", { uid, phone: maskPhone(phone) });
  await setDoc(doc(db, "users", uid), {
    updatedAt: serverTimestamp(),
    phone,
    name: profile?.name || "",
    email: profile?.email || "",
    address: profile?.address || "",
    referrer: profile?.referrer || "",
    memberNo: profile?.memberNo || "",
    joinedAt: profile?.joinedAt || profile?.createdAt || ""
  }, { merge: true });
  logStep("firestore:user:write:done", { uid });
}

async function maybeSaveMemberProfileFromLocal(uid, phone, profile, reason) {
  if (!firebaseReady || !uid) return;
  const { doc, getDoc } = firebaseApi.firestoreModule;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    console.info("[IRIS Firebase member upload blocked]", {
      uid,
      reason,
      firestoreHasUser: true,
      message: "Firestore 회원정보가 있어 localStorage 회원정보 업로드를 차단했습니다."
    });
    logStep("firestore:user:local-upload:blocked", { uid, reason });
    return;
  }
  console.info("[IRIS Firebase member initial upload]", {
    uid,
    reason,
    firestoreHasUser: false,
    message: "Firestore 회원정보가 없어 localStorage 회원정보를 최초 업로드합니다."
  });
  await saveMemberProfile(uid, phone, profile);
}

async function loadRemoteSnapshot(uid) {
  const { doc, getDoc } = firebaseApi.firestoreModule;
  const ref = doc(db, "users", uid, "sync", "localStorage");
  logStep("firestore:snapshot:read:start", { uid });
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    logStep("firestore:snapshot:read:empty", { uid });
    console.info("[IRIS Firebase read]", {
      uid,
      firestorePath: `users/${uid}/sync/localStorage`,
      success: true,
      hasData: false
    });
    remoteSnapshotMeta = { uid, hasData: false, keyCount: 0 };
    remoteSnapshotLoadedForUid = uid;
    return;
  }

  const data = snap.data()?.data || {};
  if (!Object.keys(data).length) {
    logStep("firestore:snapshot:read:no-keys", { uid });
    console.info("[IRIS Firebase read]", {
      uid,
      firestorePath: `users/${uid}/sync/localStorage`,
      success: true,
      hasData: false,
      keyCount: 0
    });
    remoteSnapshotMeta = { uid, hasData: false, keyCount: 0 };
    remoteSnapshotLoadedForUid = uid;
    return;
  }
  logStep("firestore:snapshot:read:done", { uid, keyCount: Object.keys(data).length });
  console.info("[IRIS Firebase read]", {
    uid,
    firestorePath: `users/${uid}/sync/localStorage`,
    success: true,
    hasData: true,
    keyCount: Object.keys(data).length
  });
  console.info("[IRIS Firebase restore]", {
    firestorePath: `users/${uid}/sync/localStorage`,
    restoredKeys: Object.keys(data).filter((key) => key === SESSION_KEY || key.startsWith(EYE_MARKERS_KEY_PREFIX) || key === "irisReadingResult")
  });

  applyingRemoteSnapshot = true;
  try {
    const remoteKeys = new Set(Object.keys(data));
    const keysToRemove = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!isManagedKey(key)) continue;
      if (key === SESSION_KEY) continue;
      if (!remoteKeys.has(key)) keysToRemove.push(key);
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    Object.entries(data).forEach(([key, value]) => {
      if (!isManagedKey(key)) return;
      if (key === SESSION_KEY && !value) return;
      localStorage.setItem(key, value);
    });
  } finally {
    applyingRemoteSnapshot = false;
  }
  remoteSnapshotMeta = { uid, hasData: true, keyCount: Object.keys(data).length };
  remoteSnapshotLoadedForUid = uid;
  console.info("[IRIS Firebase restore success]", {
    uid,
    restoredFromFirestore: true,
    localStorageIgnored: true,
    removedLocalOnlyKeys: "managed keys not present in Firestore"
  });

  if (!sessionStorage.getItem("irisFirebaseSnapshotLoaded")) {
    sessionStorage.setItem("irisFirebaseSnapshotLoaded", "1");
    if (!location.hash.includes("no-reload")) location.reload();
  }
}

function hasRemoteSnapshotData(uid) {
  return Boolean(remoteSnapshotMeta && remoteSnapshotMeta.uid === uid && remoteSnapshotMeta.hasData);
}

async function testWrite() {
  if (!firebaseReady) throw new Error("Firebase가 아직 준비되지 않았습니다.");
  if (!currentUser) throw new Error("Firebase 로그인 사용자가 없습니다. 앱에서 먼저 로그인해주세요.");
  const { doc, setDoc, serverTimestamp } = firebaseApi.firestoreModule;
  const payload = {
    checkedAt: serverTimestamp(),
    href: location.href,
    localSession: maskPhone(localStorage.getItem(SESSION_KEY)),
    userAgent: navigator.userAgent
  };
  logStep("firestore:test:write:start", { uid: currentUser.uid });
  await setDoc(doc(db, "users", currentUser.uid, "debug", "lastWrite"), payload, { merge: true });
  logStep("firestore:test:write:done", { uid: currentUser.uid });
  return payload;
}

function collectLocalStorageSnapshot() {
  const result = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!isManagedKey(key)) continue;
    const value = localStorage.getItem(key);
    if (typeof value !== "string") continue;
    if (new Blob([value]).size > MAX_VALUE_BYTES) continue;
    result[key] = value;
  }
  return result;
}

function isManagedKey(key) {
  return managedKeyPatterns.some((pattern) => pattern.test(String(key || "")));
}

function getCurrentProfile(phone, snapshot) {
  if (!phone) return null;
  const users = parseJsonValue(snapshot[USERS_KEY]) || readJson(USERS_KEY, {});
  return users?.[phone] || null;
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch (_) {
    return fallback;
  }
}

function parseJsonValue(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (_) {
    return value;
  }
}

function logStep(step, details = {}) {
  const entry = { at: new Date().toISOString(), step, details };
  debugEntries.push(entry);
  if (debugEntries.length > 120) debugEntries.shift();
  console.info("[IRIS Firebase]", step, details);
}

function logError(step, error) {
  const details = {
    code: error?.code || "",
    message: error?.message || String(error || "")
  };
  lastFirebaseError = { step, ...details };
  const entry = { at: new Date().toISOString(), step, details };
  debugEntries.push(entry);
  if (debugEntries.length > 120) debugEntries.shift();
  console.error("[IRIS Firebase]", step, details, error);
}

function maskPhone(value) {
  const phone = normalizePhone(value);
  if (phone.length < 4) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}
