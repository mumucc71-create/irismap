const FIREBASE_SDK_VERSION = "10.12.5";
const CONFIG = window.IRIS_FIREBASE_CONFIG || {};
const SESSION_KEY = "irisMappingSession";
const USERS_KEY = "irisMappingUsers";
const EYE_MARKERS_KEY_PREFIX = "irisEyeMarkers";
const MAX_VALUE_BYTES = 850000;
const SYNC_DEBOUNCE_MS = 900;
const ANALYSIS_DOC_ID = "current";
const LEGACY_ANALYSIS_DOC_ID = "latest";

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
let storage;
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
  getMemberProfile,
  resetCurrentUserData,
  saveIrisEyeState,
  loadIrisAnalysis,
  saveIrisSnapshot,
  listIrisSnapshots,
  loadIrisSnapshot,
  deleteIrisSnapshot,
  debugSyncInfo,
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
  const storageModule = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-storage.js`);
  logStep("sdk:import:done");

  const app = appModule.initializeApp(CONFIG);
  logStep("initializeApp:done", { appName: app.name });
  auth = authModule.getAuth(app);
  db = firestoreModule.getFirestore(app);
  storage = storageModule.getStorage(app);
  logStep("getFirestore:done", { projectId: CONFIG.projectId });
  firebaseApi = { authModule, firestoreModule, storageModule };
  firebaseReady = true;
  window.IrisFirebase.ready = true;
  window.IrisFirebase.enabled = true;

  patchLocalStorage();

  authModule.onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    logStep("auth:state", { uid: user?.uid || null, email: user?.email || null });
    if (user) {
      const phoneKey = normalizePhone(localStorage.getItem(SESSION_KEY) || user.email || "");
      console.info("[IRIS Firebase UID CHECK]", {
        uid: user.uid,
        email: user.email || "",
        phoneKey,
        analysisReadPath: `users/${user.uid}/analysis/${ANALYSIS_DOC_ID}`,
        analysisWritePath: `users/${user.uid}/analysis/${ANALYSIS_DOC_ID}`,
        snapshotReadPath: `users/${user.uid}/sync/localStorage`,
        snapshotWritePath: `users/${user.uid}/sync/localStorage`,
        analysisReadWriteSame: true
      });
    }
    if (!user) return;
    try {
      await restoreMemberProfileFromFirestore(user.uid, "auth:state");
      await ensureRemoteSnapshotLoaded(user.uid);
      await maybeInitialUploadFromLocal(user.uid, "auth:state");
      window.dispatchEvent(new CustomEvent("irisFirebaseReadyForApp", { detail: { uid: user.uid } }));
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
  await restoreMemberProfileFromFirestore(currentUser.uid, "auth:login");
  await maybeSaveMemberProfileFromLocal(currentUser.uid, phoneKey, { ...profile, name: name || profile.name || "", phone: profile.phone || phoneKey }, "auth:login");
  await maybeInitialUploadFromLocal(currentUser.uid, "auth:login");
  return currentUser;
}

async function signOut() {
  if (!firebaseReady) return;
  await firebaseApi.authModule.signOut(auth);
}

async function resetCurrentUserData() {
  if (!firebaseReady) throw new Error("Firebase가 아직 준비되지 않았습니다.");
  if (!currentUser?.uid) throw new Error("현재 로그인한 Firebase 사용자가 없습니다.");

  const uid = currentUser.uid;
  const { doc, deleteDoc } = firebaseApi.firestoreModule;
  logStep("reset:start", { uid });

  clearTimeout(syncTimer);
  syncTimer = null;
  applyingRemoteSnapshot = true;

  const documentRefs = [
    doc(db, "users", uid, "sync", "localStorage"),
    doc(db, "users", uid, "analysis", ANALYSIS_DOC_ID),
    doc(db, "users", uid, "analysis", "latest"),
    doc(db, "users", uid, "irisResults", "latest"),
    doc(db, "users", uid, "irisMarkers", "latest"),
    doc(db, "users", uid, "cart", "current"),
    doc(db, "users", uid, "orders", "history"),
    doc(db, "users", uid, "consultations", "history"),
    doc(db, "users", uid, "products", "operatorCatalog"),
    doc(db, "users", uid, "debug", "lastWrite")
  ];

  for (const ref of documentRefs) {
    await deleteDoc(ref).catch((error) => {
      logError("reset:delete-child:error", error);
    });
  }
  await deleteDoc(doc(db, "users", uid)).catch((error) => {
    logError("reset:delete-user:error", error);
  });

  await deleteIndexedDb(EYE_PHOTO_DB_NAME);

  remoteSnapshotLoadedForUid = "";
  remoteSnapshotPromise = null;
  remoteSnapshotMeta = null;
  firestoreWriteUnlockedForUid = "";

  localStorage.clear();
  sessionStorage.clear();
  await firebaseApi.authModule.signOut(auth);
  currentUser = null;
  applyingRemoteSnapshot = false;
  logStep("reset:done", { uid });
  console.info("[IRIS Firebase reset]", {
    uid,
    firestoreDeleted: true,
    localStorageCleared: true,
    sessionStorageCleared: true,
    signedOut: true,
    message: "초기화 완료"
  });
  return { uid, message: "초기화 완료" };
}

function deleteIndexedDb(name) {
  return new Promise((resolve) => {
    if (!window.indexedDB || !name) {
      resolve(false);
      return;
    }
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve(true);
    request.onerror = () => resolve(false);
    request.onblocked = () => resolve(false);
  });
}

async function saveIrisEyeState(payload = {}) {
  if (!firebaseReady || !currentUser?.uid) return null;
  const eyeKey = payload.eyeKey === "left" ? "left" : "right";
  const uid = currentUser.uid;
  const { doc, getDoc, setDoc, serverTimestamp } = firebaseApi.firestoreModule;
  const { ref, uploadBytes, getDownloadURL } = firebaseApi.storageModule;
  const analysisRef = doc(db, "users", uid, "analysis", ANALYSIS_DOC_ID);
  const legacyAnalysisRef = doc(db, "users", uid, "analysis", LEGACY_ANALYSIS_DOC_ID);
  console.info("[IRIS Firebase path check]", {
    uid,
    writePath: `users/${uid}/analysis/${ANALYSIS_DOC_ID}`,
    readPath: `users/${uid}/analysis/${ANALYSIS_DOC_ID}`,
    samePath: true,
    eyeKey
  });
  let currentSnap = await getDoc(analysisRef).catch(() => null);
  if (!currentSnap?.exists?.()) {
    currentSnap = await getDoc(legacyAnalysisRef).catch(() => null);
    if (currentSnap?.exists?.()) {
      console.info("[IRIS Firebase analysis fallback]", {
        uid,
        fallbackReadPath: `users/${uid}/analysis/${LEGACY_ANALYSIS_DOC_ID}`,
        writePath: `users/${uid}/analysis/${ANALYSIS_DOC_ID}`
      });
    }
  }
  const existing = currentSnap?.exists?.() ? (currentSnap.data()?.[eyeKey] || {}) : {};
  const nextEye = {
    ...existing,
    eyeKey,
    fileName: payload.fileName || existing.fileName || `${eyeKey}-iris`,
    geometry: payload.geometry || existing.geometry || null,
    markers: Array.isArray(payload.markers) ? payload.markers : (existing.markers || []),
    updatedAt: new Date().toISOString()
  };

  if (payload.blob) {
    const originalPath = `users/${uid}/iris/${eyeKey}/original-${Date.now()}.jpg`;
    const originalRef = ref(storage, originalPath);
    await uploadBytes(originalRef, payload.blob, { contentType: payload.blob.type || "image/jpeg" });
    nextEye.originalPath = originalPath;
    nextEye.originalUrl = await getDownloadURL(originalRef);
  }

  if (payload.normalizedBlob) {
    const normalizedPath = `users/${uid}/iris/${eyeKey}/normalized-${Date.now()}.jpg`;
    const normalizedRef = ref(storage, normalizedPath);
    await uploadBytes(normalizedRef, payload.normalizedBlob, { contentType: payload.normalizedBlob.type || "image/jpeg" });
    nextEye.normalizedPath = normalizedPath;
    nextEye.normalizedUrl = await getDownloadURL(normalizedRef);
  }

  await setDoc(analysisRef, {
    [eyeKey]: nextEye,
    updatedAt: serverTimestamp()
  }, { merge: true });

  await setDoc(doc(db, "users", uid, "irisMarkers", "latest"), {
    updatedAt: serverTimestamp(),
    [`${eyeKey}EyeMarkers`]: nextEye.markers
  }, { merge: true });

  console.info("[IRIS Firebase eye saved]", {
    uid,
    eyeKey,
    hasImage: Boolean(nextEye.originalUrl),
    markerCount: nextEye.markers.length,
    firestorePath: `users/${uid}/analysis/${ANALYSIS_DOC_ID}`
  });
  return nextEye;
}

async function loadIrisAnalysis() {
  if (!firebaseReady || !currentUser?.uid) return null;
  const uid = currentUser.uid;
  const { doc, getDoc } = firebaseApi.firestoreModule;
  const readPath = `users/${uid}/analysis/${ANALYSIS_DOC_ID}`;
  const legacyReadPath = `users/${uid}/analysis/${LEGACY_ANALYSIS_DOC_ID}`;
  const analysisRef = doc(db, "users", uid, "analysis", ANALYSIS_DOC_ID);
  const legacyAnalysisRef = doc(db, "users", uid, "analysis", LEGACY_ANALYSIS_DOC_ID);
  logStep("firestore:analysis:read:start", { uid, readPath });
  console.info("[IRIS Firebase path check]", {
    uid,
    readPath,
    writePath: readPath,
    samePath: true
  });
  let snap = await getDoc(analysisRef);
  let usedPath = readPath;
  if (!snap.exists()) {
    const legacySnap = await getDoc(legacyAnalysisRef).catch(() => null);
    if (legacySnap?.exists?.()) {
      snap = legacySnap;
      usedPath = legacyReadPath;
      console.info("[IRIS Firebase analysis fallback]", {
        uid,
        readPath,
        fallbackReadPath: legacyReadPath,
        message: "current 문서가 없어 기존 latest 문서를 읽었습니다."
      });
    }
  }
  if (!snap.exists()) {
    logStep("firestore:analysis:read:empty", { uid, readPath });
    console.info("[IRIS Firebase analysis]", {
      uid,
      exists: false,
      firestorePath: readPath,
      readPath,
      writePath: readPath,
      samePath: true
    });
    return null;
  }
  const data = snap.data() || {};
  console.info("[IRIS Firebase analysis]", {
    uid,
    exists: true,
    firestorePath: usedPath,
    readPath: usedPath,
    writePath: readPath,
    samePath: usedPath === readPath,
    keys: Object.keys(data),
    rightEyeImage: Boolean(data.right?.originalUrl),
    leftEyeImage: Boolean(data.left?.originalUrl),
    rightEyeMarkers: Array.isArray(data.right?.markers) ? data.right.markers.length : 0,
    leftEyeMarkers: Array.isArray(data.left?.markers) ? data.left.markers.length : 0
  });
  console.info("[IRIS Firebase analysis raw JSON]", data);
  logStep("firestore:analysis:read:done", { uid, readPath: usedPath });
  return data;
}

async function saveIrisSnapshot(snapshot = {}) {
  if (!firebaseReady || !currentUser?.uid) return null;
  const uid = currentUser.uid;
  const { collection, addDoc, serverTimestamp } = firebaseApi.firestoreModule;
  const savesRef = collection(db, "users", uid, "irisPhotoSaves");
  const payload = {
    ...snapshot,
    uid,
    savedAt: snapshot.savedAt || new Date().toISOString(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const ref = await addDoc(savesRef, payload);
  console.info("[IRIS Firebase snapshot saved]", {
    uid,
    snapshotId: ref.id,
    markerCount: payload.summary?.markerCount || 0,
    firestorePath: `users/${uid}/irisPhotoSaves/${ref.id}`
  });
  return { id: ref.id, ...payload };
}

async function listIrisSnapshots() {
  if (!firebaseReady || !currentUser?.uid) return [];
  const uid = currentUser.uid;
  const { collection, getDocs, query, orderBy } = firebaseApi.firestoreModule;
  const savesRef = collection(db, "users", uid, "irisPhotoSaves");
  const q = query(savesRef, orderBy("savedAt", "desc"));
  const snap = await getDocs(q);
  const rows = [];
  snap.forEach((item) => rows.push({ id: item.id, ...item.data() }));
  console.info("[IRIS Firebase snapshot list]", { uid, count: rows.length });
  return rows;
}

async function loadIrisSnapshot(snapshotId) {
  if (!firebaseReady || !currentUser?.uid || !snapshotId) return null;
  const uid = currentUser.uid;
  const { doc, getDoc } = firebaseApi.firestoreModule;
  const ref = doc(db, "users", uid, "irisPhotoSaves", snapshotId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = { id: snap.id, ...snap.data() };
  console.info("[IRIS Firebase snapshot loaded]", {
    uid,
    snapshotId,
    rightMarkers: Array.isArray(data.right?.markers) ? data.right.markers.length : 0,
    leftMarkers: Array.isArray(data.left?.markers) ? data.left.markers.length : 0
  });
  return data;
}

async function deleteIrisSnapshot(snapshotId) {
  if (!firebaseReady || !currentUser?.uid || !snapshotId) return false;
  const uid = currentUser.uid;
  const { doc, deleteDoc } = firebaseApi.firestoreModule;
  await deleteDoc(doc(db, "users", uid, "irisPhotoSaves", snapshotId));
  console.info("[IRIS Firebase snapshot deleted]", {
    uid,
    snapshotId,
    firestorePath: `users/${uid}/irisPhotoSaves/${snapshotId}`
  });
  return true;
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

async function getMemberProfile(uid = currentUser?.uid) {
  if (!firebaseReady || !uid) return null;
  const { doc, getDoc } = firebaseApi.firestoreModule;
  const ref = doc(db, "users", uid);
  logStep("firestore:user:read:start", { uid });
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    logStep("firestore:user:read:empty", { uid });
    console.info("[IRIS Firebase member]", {
      uid,
      firestorePath: `users/${uid}`,
      exists: false
    });
    return null;
  }
  const profile = snap.data() || {};
  logStep("firestore:user:read:done", {
    uid,
    keys: Object.keys(profile)
  });
  console.info("[IRIS Firebase member]", {
    uid,
    firestorePath: `users/${uid}`,
    exists: true,
    keys: Object.keys(profile),
    name: profile.name || "",
    phone: maskPhone(profile.phone || ""),
    email: profile.email || ""
  });
  return profile;
}

async function restoreMemberProfileFromFirestore(uid, reason) {
  const profile = await getMemberProfile(uid);
  if (!profile) return false;
  const phone = normalizePhone(profile.phone || localStorage.getItem(SESSION_KEY));
  if (!phone) return false;

  applyingRemoteSnapshot = true;
  try {
    const users = readJson(USERS_KEY, {});
    const previous = users[phone] || {};
    users[phone] = {
      ...previous,
      name: profile.name || previous.name || "",
      phone: profile.phone || previous.phone || phone,
      email: profile.email || previous.email || "",
      address: profile.address || previous.address || "",
      referrer: profile.referrer || previous.referrer || "",
      memberNo: profile.memberNo || previous.memberNo || "",
      joinedAt: profile.joinedAt || previous.joinedAt || previous.createdAt || "",
      syncedFromFirestore: true
    };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, phone);
  } finally {
    applyingRemoteSnapshot = false;
  }

  console.info("[IRIS Firebase member restore success]", {
    uid,
    reason,
    phone: maskPhone(phone),
    restoredFields: ["name", "phone", "email"],
    localStorageRole: "cache"
  });
  window.dispatchEvent(new CustomEvent("irisMemberProfileRestored", {
    detail: { uid, phone }
  }));
  return true;
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
  console.info("[IRIS Firebase restore diagnostics]", {
    "1 Firebase Auth uid": uid,
    "2 Firestore 읽기 시작": true,
    firestorePath: `users/${uid}/sync/localStorage`
  });
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    logStep("firestore:snapshot:read:empty", { uid });
    console.info("[IRIS Firebase read]", {
      uid,
      firestorePath: `users/${uid}/sync/localStorage`,
      success: true,
      hasData: false
    });
    console.info("[IRIS Firebase raw JSON]", null);
    console.info("[IRIS Firebase restore diagnostics]", {
      "1 Firebase Auth uid": uid,
      "2 Firestore 읽기 시작": true,
      "3 Firestore 문서 존재 여부": false,
      "4 읽어온 문서의 key 목록": [],
      "5 rightEyeImage 존재 여부": false,
      "6 leftEyeImage 존재 여부": false,
      "7 rightEyeMarkers 개수": 0,
      "8 leftEyeMarkers 개수": 0
    });
    remoteSnapshotMeta = { uid, hasData: false, keyCount: 0 };
    remoteSnapshotLoadedForUid = uid;
    return;
  }

  const data = snap.data()?.data || {};
  const snapshotSummary = summarizeRemoteSnapshot(data);
  if (!Object.keys(data).length) {
    logStep("firestore:snapshot:read:no-keys", { uid });
    console.info("[IRIS Firebase read]", {
      uid,
      firestorePath: `users/${uid}/sync/localStorage`,
      success: true,
      hasData: false,
      keyCount: 0
    });
    console.info("[IRIS Firebase raw JSON]", data);
    console.info("[IRIS Firebase restore diagnostics]", {
      "1 Firebase Auth uid": uid,
      "2 Firestore 읽기 시작": true,
      "3 Firestore 문서 존재 여부": true,
      "4 읽어온 문서의 key 목록": [],
      "5 rightEyeImage 존재 여부": false,
      "6 leftEyeImage 존재 여부": false,
      "7 rightEyeMarkers 개수": 0,
      "8 leftEyeMarkers 개수": 0
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
  console.info("[IRIS Firebase raw JSON]", data);
  console.info("[IRIS Firebase restore diagnostics]", {
    "1 Firebase Auth uid": uid,
    "2 Firestore 읽기 시작": true,
    "3 Firestore 문서 존재 여부": true,
    "4 읽어온 문서의 key 목록": snapshotSummary.keys,
    "5 rightEyeImage 존재 여부": snapshotSummary.rightEyeImageExists,
    "6 leftEyeImage 존재 여부": snapshotSummary.leftEyeImageExists,
    "7 rightEyeMarkers 개수": snapshotSummary.rightEyeMarkersCount,
    "8 leftEyeMarkers 개수": snapshotSummary.leftEyeMarkersCount,
    note: "이미지는 현재 Firestore가 아니라 IndexedDB eyePhotos에서 화면 적용 여부를 추가 확인합니다."
  });
  console.info("[IRIS Firebase restore]", {
    firestorePath: `users/${uid}/sync/localStorage`,
    restoredKeys: Object.keys(data).filter((key) => key === SESSION_KEY || key.startsWith(EYE_MARKERS_KEY_PREFIX) || key === "irisReadingResult")
  });

  applyingRemoteSnapshot = true;
  try {
    const mergedCartValue = mergeCartSnapshotValues(
      localStorage.getItem(structuredKeys.cart),
      data[structuredKeys.cart]
    );
    if (mergedCartValue) data[structuredKeys.cart] = mergedCartValue;

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

function summarizeRemoteSnapshot(data) {
  const keys = Object.keys(data || {});
  const phone = normalizePhone(data?.[SESSION_KEY] || "");
  const rightMarkers = parseJsonValue(data?.[`${EYE_MARKERS_KEY_PREFIX}:${phone}:right`]) || [];
  const leftMarkers = parseJsonValue(data?.[`${EYE_MARKERS_KEY_PREFIX}:${phone}:left`]) || [];
  return {
    keys,
    rightEyeImageExists: Boolean(findNestedValueByNames(data, ["rightEyeImage", "rightImage", "rightEyePhoto", "rightPhoto"])),
    leftEyeImageExists: Boolean(findNestedValueByNames(data, ["leftEyeImage", "leftImage", "leftEyePhoto", "leftPhoto"])),
    rightEyeMarkersCount: Array.isArray(rightMarkers) ? rightMarkers.length : 0,
    leftEyeMarkersCount: Array.isArray(leftMarkers) ? leftMarkers.length : 0
  };
}

function findNestedValueByNames(value, names, depth = 0) {
  if (!value || typeof value !== "object" || depth > 4) return null;
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(value, name) && value[name]) return value[name];
  }
  for (const child of Object.values(value)) {
    const found = findNestedValueByNames(child, names, depth + 1);
    if (found) return found;
  }
  return null;
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

function mergeCartSnapshotValues(localValue, remoteValue) {
  const localCart = normalizeCartItems(parseJsonValue(localValue));
  const remoteCart = normalizeCartItems(parseJsonValue(remoteValue));
  if (!localCart.length && !remoteCart.length) return remoteValue || localValue || "";

  const merged = new Map();
  remoteCart.forEach((item, index) => {
    merged.set(getCartMergeKey(item, index), item);
  });
  localCart.forEach((item, index) => {
    const key = getCartMergeKey(item, index);
    const previous = merged.get(key);
    if (!previous) {
      merged.set(key, item);
      return;
    }
    merged.set(key, {
      ...previous,
      ...item,
      quantity: Math.max(Number(previous.quantity || 1), Number(item.quantity || 1))
    });
  });

  return JSON.stringify(Array.from(merged.values()));
}

function normalizeCartItems(value) {
  return Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [];
}

function getCartMergeKey(item, index) {
  if (item.productId === "iris-camera") return "product:iris-camera";
  return String(item.cartItemId || item.productId || item.name || index);
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
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("0082")) digits = digits.slice(4);
  if (digits.startsWith("82")) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("10")) digits = `0${digits}`;
  return digits;
}

function debugSyncInfo() {
  const uid = currentUser?.uid || "";
  const phone = normalizePhone(localStorage.getItem(SESSION_KEY));
  const info = {
    uid,
    email: currentUser?.email || "",
    phone,
    firestoreAnalysisReadPath: uid ? `users/${uid}/analysis/${ANALYSIS_DOC_ID}` : "",
    firestoreAnalysisWritePath: uid ? `users/${uid}/analysis/${ANALYSIS_DOC_ID}` : "",
    firestoreSnapshotPath: uid ? `users/${uid}/sync/localStorage` : "",
    sameAnalysisPath: true,
    remoteSnapshotMeta,
    firebaseReady
  };
  console.info("[IRIS Firebase debugSyncInfo]", info);
  return info;
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
