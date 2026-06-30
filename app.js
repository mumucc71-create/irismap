const canvas = document.querySelector("#irisCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const chartInput = document.querySelector("#chartInput");
const pairInput = document.querySelector("#pairInput");
const leftCameraInput = document.querySelector("#leftCameraInput");
const rightCameraInput = document.querySelector("#rightCameraInput");
const leftCameraButton = document.querySelector("#leftCameraButton");
const rightCameraButton = document.querySelector("#rightCameraButton");
const chartPreview = document.querySelector("#chartPreview");
const chartEmpty = document.querySelector("#chartEmpty");
const emptyState = document.querySelector("#emptyState");
const exportButton = document.querySelector("#exportButton");
const autoDetectButton = document.querySelector("#autoDetectButton");
const mappingButton = document.querySelector("#mappingButton");
const universeButton = document.querySelector("#universeButton");
const clearMarkersButton = document.querySelector("#clearMarkersButton");
const swapEyesButton = document.querySelector("#swapEyesButton");
const markerList = document.querySelector("#markerList");
const selectionDetails = document.querySelector("#selectionDetails");
const detailMap = document.querySelector("#detailMap");
const photoCards = document.querySelectorAll("[data-eye]");
const rightPhotoName = document.querySelector("#rightPhotoName");
const leftPhotoName = document.querySelector("#leftPhotoName");
const authScreen = document.querySelector("#authScreen");
const appShell = document.querySelector("#appShell");
const loginForm = document.querySelector("#loginForm");
const signupForm = document.querySelector("#signupForm");
const authMessage = document.querySelector("#authMessage");
const logoutButton = document.querySelector("#logoutButton");
const healthQuestionnaireButton = document.querySelector("#healthQuestionnaireButton");
const centerResetButton = document.querySelector("#centerResetButton");
const alignmentSaveButton = document.querySelector("#alignmentSaveButton");
const alignmentStatus = document.querySelector("#alignmentStatus");
const observationTypeButtons = document.querySelector("#observationTypeButtons");
const observationStrengthButtons = document.querySelector("#observationStrengthButtons");
const manualObservationList = document.querySelector("#manualObservationList");
const manualObservationGuide = document.querySelector("#manualObservationGuide");
const deleteObservationButton = document.querySelector("#deleteObservationButton");
const clearObservationsButton = document.querySelector("#clearObservationsButton");
const saveIrisSessionButton = document.querySelector("#saveIrisSessionButton");
const loadIrisSessionButton = document.querySelector("#loadIrisSessionButton");
const resetIrisPointsButton = document.querySelector("#resetIrisPointsButton");
const largeIrisViewButton = document.querySelector("#largeIrisViewButton");
const rightEyeZoomOutButton = document.querySelector("#rightEyeZoomOutButton");
const rightEyeZoomInButton = document.querySelector("#rightEyeZoomInButton");
const leftEyeZoomOutButton = document.querySelector("#leftEyeZoomOutButton");
const leftEyeZoomInButton = document.querySelector("#leftEyeZoomInButton");
const eraserModeButton = document.querySelector("#eraserModeButton");
const irisSaveStatus = document.querySelector("#irisSaveStatus");
const irisSaveListPanel = document.querySelector("#irisSaveListPanel");
const irisSaveList = document.querySelector("#irisSaveList");
const closeIrisSaveListButton = document.querySelector("#closeIrisSaveListButton");

const controls = {
  centerX: document.querySelector("#centerX"),
  centerY: document.querySelector("#centerY"),
  pupilRadius: document.querySelector("#pupilRadius"),
  irisRadius: document.querySelector("#irisRadius"),
  rotation: document.querySelector("#overlayRotation")
};

const VIEW_WIDTH = 640;
const VIEW_HEIGHT = 360;
const NORMALIZED_IRIS_RADIUS = 118;
const NORMALIZED_CENTER_X = VIEW_WIDTH / 2;
const NORMALIZED_CENTER_Y = VIEW_HEIGHT / 2;
const LEFT_EYE_AUTO_FALLBACK_OFFSET_X = 38;
const LEFT_EYE_AUTO_FALLBACK_OFFSET_Y = 28;

const zoneStyles = {
  "1시": { color: "#4577b8", group: "눈·귀·코·얼굴", note: "감각 기관과 머리 주변 반응" },
  "2시": { color: "#2397a6", group: "폐·기관지·흉부", note: "우측 상부 폐와 기관지 반응" },
  "3시": { color: "#4e9a39", group: "폐 중심", note: "폐 중심, 환기와 순환 반응" },
  "4시": { color: "#c7a218", group: "소장·명장·하복부", note: "소화기와 하복부 반응" },
  "5시": { color: "#c05a2c", group: "신장·요관", note: "요관, 비뇨 계통 반응" },
  "6시": { color: "#a73563", group: "골반·생식·비뇨", note: "골반, 생식, 비뇨 계통 반응" },
  "7시": { color: "#9b7b10", group: "간·담낭·소장", note: "간담도와 장 기능 반응" },
  "8시": { color: "#a06416", group: "비장·췌장·대장", note: "췌장, 비장, 대장 반응" },
  "9시": { color: "#c13f33", group: "심장·폐·순환", note: "좌측 흉부와 순환 반응" },
  "10시": { color: "#bd2f74", group: "목·어깨·림프", note: "목, 어깨, 림프 반응" },
  "11시": { color: "#6c3e9f", group: "전두엽·변연계", note: "뇌, 감각, 자율신경 반응" },
  "12시": { color: "#244d9c", group: "뇌·신경·정신", note: "대뇌, 소뇌, 시상하부 반응" }
};

const signExamples = [
  { name: "점", text: "흑색 또는 갈색 점, 국소 정체 반응" },
  { name: "선", text: "방사선 모양의 선, 긴장 또는 자극 반응" },
  { name: "함몰", text: "구멍처럼 꺼진 형태, 조직 약화 반응" },
  { name: "스트레스 링", text: "원형 링, 반복 스트레스와 긴장 반응" },
  { name: "색 변화", text: "회색, 탁색, 갈색 변화" },
  { name: "섬유 끊김", text: "섬유 단절 또는 비정상 패턴" }
];

const manualObservationLabels = {
  DOT: "점",
  LINE: "선",
  LACUNA: "함몰",
  FIBER_SPREAD: "섬유퍼짐",
  PIGMENT: "색소점",
  RING: "고리",
  FIBER_BREAK: "섬유끊김",
  IRREGULAR: "불규칙패턴"
};

const manualPatternDescriptions = {
  DOT: "예전에 생긴 흔적으로 참고합니다.",
  LINE: "오랫동안 반복된 흔적으로 참고합니다.",
  LACUNA: "관심을 가지고 관리해 보세요.",
  FIBER_SPREAD: "생활습관으로 관리해 보세요.",
  PIGMENT: "오래전부터 있었던 표시로 참고합니다.",
  RING: "피로나 긴장과 함께 참고해 보세요.",
  FIBER_BREAK: "현재 상태를 한 번 더 확인해 보세요.",
  IRREGULAR: "생활습관으로 관리해 보세요."
};

const state = {
  map: null,
  activeEye: "right",
  chartImage: null,
  stackedLayout: false,
  largeView: false,
  largeEyeKey: "right",
  irisViewScale: Number(localStorage.getItem("irisViewScale") || 1),
  eraserMode: false,
  overlayVisible: false,
  manualObservationType: "DOT",
  manualObservationStrength: "중",
  selectedObservationId: null,
  collaretteObservations: {},
  eyes: {
    right: createEyeState(),
    left: createEyeState()
  }
};

const AUTH_USERS_KEY = "irisMappingUsers";
const AUTH_SESSION_KEY = "irisMappingSession";
const MAPPING_OVERLAY_KEY_PREFIX = "irisMappingOverlayVisible";
const IRIS_EYE_MARKERS_KEY_PREFIX = "irisEyeMarkers";
const EYE_PHOTO_DB_NAME = "irisMappingPhotoStore";
const EYE_PHOTO_STORE_NAME = "eyePhotos";
const EYE_PHOTO_DB_VERSION = 1;
const DEFAULT_MEMBERS = [
  {
    joinedAt: "2026. 5. 28 오후",
    memberNo: "MB2026052822",
    name: "이고은",
    phone: "1089872402",
    email: "mumucc71@gm",
    address: "복수리1717 301",
    referrer: "권영태",
    password: "pero5499",
    createdAt: "2026-05-28T00:00:00.000Z"
  }
];

initializeAuth();
init();

async function init() {
  state.map = await fetch("data/iris-map.json").then((response) => response.json());

  const previousPhoto = localStorage.getItem("previousIrisPhoto");
  if (previousPhoto) {
    chartPreview.src = previousPhoto;
    chartPreview.style.display = "block";
    chartEmpty.hidden = true;
    state.chartImage = await loadImageFromSrc(previousPhoto);
  }

  await restoreSavedEyeImagesForCurrentUser();
  restoreMappingOverlayState();

  updateCanvasLayout();
  renderDetailMap(null);
  updateOverlayButtonLabel();
  updateObservationTypeButtons();
  updateObservationStrengthButtons();
  renderManualObservations();
  draw();
}

let resizeTimer = null;

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {
    updateCanvasLayout();
    draw();
  }, 120);
});

window.addEventListener("irisFirebaseReadyForApp", async () => {
  await restoreSavedEyeImagesForCurrentUser({ preferFirebase: true });
});

healthQuestionnaireButton?.addEventListener("click", () => {
  location.href = "health.html";
});

function updateCanvasLayout() {
  const shouldStack = false;
  const nextWidth = state.largeView ? VIEW_WIDTH : VIEW_WIDTH * 2;
  const nextHeight = VIEW_HEIGHT;

  state.stackedLayout = shouldStack;

  if (canvas.width !== nextWidth) canvas.width = nextWidth;
  if (canvas.height !== nextHeight) canvas.height = nextHeight;

  canvas.classList.toggle("is-stacked", shouldStack);
}

function initializeAuth() {
  if (!authScreen || !appShell) return;

  const session = localStorage.getItem(AUTH_SESSION_KEY);
  if (session) {
    showApp();
  } else {
    showAuth();
  }
  prepareSignupDefaults();

  signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const joinedAt = new Date().toISOString().slice(0, 10);
    const memberNo = createMemberNo();
    const name = document.querySelector("#signupName").value.trim();
    const phone = document.querySelector("#signupPhone").value.trim();
    const email = document.querySelector("#signupEmail").value.trim();
    const address = document.querySelector("#signupAddress").value.trim();
    const referrer = document.querySelector("#signupReferrer").value.trim();
    const phoneKey = normalizePhone(phone);

    if (!name || !phoneKey || !email || !address || !referrer) {
      setAuthMessage("이름, 전화번호, 이메일, 주소, 추천인을 모두 입력해주세요.");
      return;
    }

    const users = getUsers();
    if (findUserByPhone(users, phoneKey)) {
      setAuthMessage("이미 가입된 전화번호입니다. 로그인해주세요.");
      return;
    }

    users[phoneKey] = {
      joinedAt,
      memberNo,
      name,
      phone,
      email,
      address,
      referrer,
      password: "",
      createdAt: new Date().toISOString()
    };
    saveUsers(users);
    localStorage.setItem(AUTH_SESSION_KEY, phoneKey);
    window.dispatchEvent(new CustomEvent("irisAuthChanged"));
    setAuthMessage("");
    signupForm.reset();
    prepareSignupDefaults();
    if (redirectAfterLogin()) return;
    showApp();
    await restoreSavedEyeImagesForCurrentUser();
    restoreMappingOverlayState();
    updateOverlayButtonLabel();
    renderManualObservations();
    draw();
  });

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.querySelector("#loginName").value.trim();
    const phone = document.querySelector("#loginPhone").value.trim();
    const phoneKey = normalizePhone(phone);
    const users = getUsers();
    let user = findUserForLogin(users, name, phoneKey);

    if (!name || !phoneKey) {
      setAuthMessage("이름과 전화번호를 입력해주세요.");
      return;
    }

    if (!user) {
      user = createLoginOnlyUser(name, phone, phoneKey);
      users[phoneKey] = user;
      saveUsers(users);
    }

    localStorage.setItem(AUTH_SESSION_KEY, phoneKey);
    window.dispatchEvent(new CustomEvent("irisAuthChanged"));
    setAuthMessage("");
    loginForm.reset();
    if (redirectAfterLogin()) return;
    showApp();
    await restoreSavedEyeImagesForCurrentUser();
    restoreMappingOverlayState();
    updateOverlayButtonLabel();
    renderManualObservations();
    draw();
  });

  logoutButton?.addEventListener("click", () => {
    localStorage.removeItem(AUTH_SESSION_KEY);
    window.dispatchEvent(new CustomEvent("irisAuthChanged"));
    clearEyeImagesFromMemory();
    prepareSignupDefaults();
    showAuth();
  });
}

function showApp() {
  authScreen.hidden = true;
  appShell.hidden = false;
}

function showAuth() {
  authScreen.hidden = false;
  appShell.hidden = true;
}

function redirectAfterLogin() {
  const target = new URLSearchParams(location.search).get("next");
  if (!target) return false;
  const cleanTarget = target.replace(/\\/g, "/");
  if (/^(https?:|file:|\/\/)/i.test(cleanTarget)) return false;
  if (!/^[\w.-]+\.html(?:[?#].*)?$/.test(cleanTarget)) return false;
  location.href = cleanTarget;
  return true;
}

function getUsers() {
  const seededUsers = getDefaultUsers();
  try {
    return { ...seededUsers, ...(JSON.parse(localStorage.getItem(AUTH_USERS_KEY)) || {}) };
  } catch {
    return seededUsers;
  }
}

function getDefaultUsers() {
  return DEFAULT_MEMBERS.reduce((users, member) => {
    users[normalizePhone(member.phone)] = member;
    return users;
  }, {});
}

function saveUsers(users) {
  const defaultKeys = new Set(Object.keys(getDefaultUsers()));
  const customUsers = Object.fromEntries(Object.entries(users).filter(([key]) => !defaultKeys.has(key)));
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(customUsers));
}

function prepareSignupDefaults() {
  return createMemberNo();
}

function createMemberNo() {
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("");
  const users = Object.values(getUsers());
  const countToday = users.filter((user) => String(user.memberNo || "").startsWith(`IM${stamp}`)).length + 1;
  return `IM${stamp}-${String(countToday).padStart(4, "0")}`;
}

function createLoginOnlyUser(name, phone, phoneKey) {
  return {
    joinedAt: new Date().toISOString().slice(0, 10),
    memberNo: createMemberNo(),
    name,
    phone,
    email: "",
    address: "",
    referrer: "",
    password: "",
    createdAt: new Date().toISOString(),
    loginOnly: true,
    phoneKey
  };
}

function normalizePhone(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("0082")) digits = digits.slice(4);
  if (digits.startsWith("82")) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("10")) digits = `0${digits}`;
  return digits;
}

function phoneVariants(value) {
  const normalized = normalizePhone(value);
  const withoutLeadingZero = normalized.replace(/^0+/, "");
  const variants = [normalized, withoutLeadingZero];
  if (normalized.length > 10) variants.push(normalized.slice(-10));
  return new Set(variants.filter(Boolean));
}

function normalizeName(value) {
  return String(value || "").trim().replace(/\s+/g, "");
}

function findUserByPhone(users, phoneKey) {
  if (!phoneKey) return null;
  if (users[phoneKey]) return users[phoneKey];
  const requestedPhones = phoneVariants(phoneKey);
  return Object.entries(users)
    .map(([key, user]) => ({ key, user }))
    .find(({ key, user }) => {
      const storedPhones = new Set([...phoneVariants(key), ...phoneVariants(user?.phone)]);
      return [...requestedPhones].some((phone) => storedPhones.has(phone));
    })
    ?.user || null;
}

function findUserByNameAndPhone(users, name, phoneKey) {
  const user = findUserByPhone(users, phoneKey);
  if (!user) return null;
  const requestedName = normalizeName(name);
  if (!requestedName) return null;
  if (!user.name) return user;
  return normalizeName(user.name) === requestedName ? user : null;
}

function findUserForLogin(users, name, phoneKey) {
  const exact = findUserByNameAndPhone(users, name, phoneKey);
  if (exact) return exact;
  return findUserByPhone(users, phoneKey);
}

function setAuthMessage(message) {
  if (authMessage) authMessage.textContent = message;
}

function createEyeState() {
  return {
    fileName: "",
    image: null,
    sourceBlob: null,
    normalizedBlob: null,
    firebaseImageSynced: false,
    alignmentMode: false,
    positionLocked: false,
    imageBounds: { x: 0, y: 0, width: canvas.width, height: canvas.height, scale: 1 },
    centerX: NORMALIZED_CENTER_X,
    centerY: NORMALIZED_CENTER_Y,
    pupilRadius: 54,
    irisRadius: 118,
    rotation: 0,
    detection: {
      pupilConfidence: 0,
      irisConfidence: 0,
      alignmentConfidence: 0,
      status: "사진 없음",
      manual: false
    },
    markers: [],
    selected: null
  };
}

chartInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const dataUrl = await fileToDataUrl(file);
  const image = await loadImageFromSrc(dataUrl);

  state.chartImage = image;
  chartPreview.src = dataUrl;
  chartPreview.style.display = "block";
  chartEmpty.hidden = true;

  localStorage.setItem("previousIrisPhoto", dataUrl);
});

pairInput.addEventListener("change", async (event) => {
  const files = [...(event.target.files || [])].slice(0, 2);
  if (files.length === 0) return;

  if (files[0]) await setEyeImage("right", files[0]);
  if (files[1]) await setEyeImage("left", files[1]);
  normalizePairView();
  await persistAllEyeStates();

  state.activeEye = "right";
  updateActiveEye();
  updatePhotoNames();
  updateUiEnabled();
  syncControls();
  renderSelection(null);
  renderMarkers();
  renderDetailMap(null);
  draw();
});

leftCameraButton?.addEventListener("click", () => leftCameraInput?.click());
rightCameraButton?.addEventListener("click", () => rightCameraInput?.click());

leftCameraInput?.addEventListener("change", (event) => handleSingleEyeCapture("left", event));
rightCameraInput?.addEventListener("change", (event) => handleSingleEyeCapture("right", event));

async function handleSingleEyeCapture(eyeKey, event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;

  await setEyeImage(eyeKey, file);
  normalizePairView();
  await persistEyeState(eyeKey);

  state.activeEye = eyeKey;
  updateActiveEye();
  updatePhotoNames();
  updateUiEnabled();
  syncControls();
  renderSelection(null);
  renderMarkers();
  renderDetailMap(null);
  draw();
}

for (const input of Object.values(controls)) {
  input.addEventListener("input", () => {
    const eye = currentEye();
    eye.centerX = Number(controls.centerX.value);
    eye.centerY = Number(controls.centerY.value);
    eye.pupilRadius = Number(controls.pupilRadius.value);
    eye.irisRadius = Math.max(Number(controls.irisRadius.value), eye.pupilRadius + 20);
    eye.rotation = Number(controls.rotation.value);
    refreshAlignmentConfidence(eye, true);
    syncControls();
    draw();
    scheduleEyeStatePersistence(state.activeEye);
  });
}

photoCards.forEach((button) => {
  button.addEventListener("click", () => {
    state.activeEye = button.dataset.eye;
    updateActiveEye();
    syncControls();
    const selected = currentEye().selected;
    const match = selected ? resolvePoint(selected.x, selected.y) : null;
    renderSelection(match);
    renderMarkers();
    renderDetailMap(match);
    draw();
  });
});

swapEyesButton.addEventListener("click", () => {
  const previousRight = state.eyes.right;
  state.eyes.right = state.eyes.left;
  state.eyes.left = previousRight;
  persistAllEyeStates();
  updatePhotoNames();
  updateUiEnabled();
  syncControls();
  renderSelection(null);
  renderMarkers();
  renderDetailMap(null);
  draw();
});

autoDetectButton.addEventListener("click", () => {
  state.overlayVisible = !state.overlayVisible;
  persistMappingOverlayState();
  updateOverlayButtonLabel();
  draw();
});

centerResetButton?.addEventListener("click", () => {
  const eye = currentEye();
  if (!eye.image) return;
  resetAndDetectEye(eye, state.activeEye);
  normalizeEyeView(eye, NORMALIZED_IRIS_RADIUS);
  eye.alignmentMode = true;
  refreshAlignmentConfidence(eye, false);
  syncControls();
  updateUiEnabled();
  draw();
  scheduleEyeStatePersistence(state.activeEye);
});

alignmentSaveButton?.addEventListener("click", async () => {
  const loadedEyes = Object.values(state.eyes).filter((eye) => eye.image);
  if (!loadedEyes.length) return;
  const shouldLock = loadedEyes.some((eye) => !eye.positionLocked);
  for (const eye of loadedEyes) {
    eye.positionLocked = shouldLock;
    if (shouldLock) {
      eye.normalizedBlob = await createNormalizedIrisBlob(eye);
      eye.firebaseImageSynced = false;
      eye.centerX = NORMALIZED_CENTER_X;
      eye.centerY = NORMALIZED_CENTER_Y;
      eye.irisRadius = NORMALIZED_IRIS_RADIUS;
      eye.alignmentMode = false;
      eye.detection = {
        ...eye.detection,
        pupilConfidence: Math.max(90, Number(eye.detection?.pupilConfidence || 0)),
        irisConfidence: 100,
        alignmentConfidence: 100,
        status: "위치 고정 완료",
        manual: true
      };
    } else {
      eye.detection = {
        ...eye.detection,
        status: "위치 고정 해제",
        manual: true
      };
    }
  }
  syncControls();
  updateUiEnabled();
  draw();
  await persistAllEyeStates();
});

clearMarkersButton?.addEventListener("click", () => {
  const eye = currentEye();
  eye.markers = [];
  eye.selected = null;
  renderSelection(null);
  renderMarkers();
  renderDetailMap(null);
  draw();
});

observationTypeButtons?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-observation-type]");
  if (!button) return;
  state.manualObservationType = button.dataset.observationType || "DOT";
  updateObservationTypeButtons();
});

observationStrengthButtons?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-observation-strength]");
  if (!button) return;
  state.manualObservationStrength = button.dataset.observationStrength || "중";
  updateObservationStrengthButtons();
  const marker = findSelectedManualObservation();
  if (!marker) return;
  marker.strength = state.manualObservationStrength;
  renderManualObservations();
  scheduleEyeStatePersistence(state.activeEye);
});

deleteObservationButton?.addEventListener("click", () => {
  const marker = findSelectedManualObservation();
  if (!marker) return;
  const eye = currentEye();
  eye.markers = eye.markers.filter((item) => item.id !== marker.id);
  state.selectedObservationId = null;
  renderManualObservations();
  renderManualObservationGuide(null);
  renderMarkers();
  draw();
  scheduleEyeStatePersistence(state.activeEye);
});

clearObservationsButton?.addEventListener("click", () => {
  const eye = currentEye();
  eye.markers = [];
  eye.selected = null;
  state.selectedObservationId = null;
  renderSelection(null);
  renderManualObservations();
  renderManualObservationGuide(null);
  renderMarkers();
  draw();
  scheduleEyeStatePersistence(state.activeEye);
});

saveIrisSessionButton?.addEventListener("click", () => {
  saveCurrentIrisSnapshot();
});

loadIrisSessionButton?.addEventListener("click", async () => {
  if (!window.IrisFirebase?.getCurrentUser?.()?.uid) {
    setIrisSaveStatus("로그인 후 불러올 수 있습니다.", true);
    return;
  }
  try {
    setIrisSaveStatus("Firestore에서 홍채사진과 점을 불러오는 중입니다...");
    await restoreSavedEyeImagesForCurrentUser({ preferFirebase: true });
    setIrisSaveStatus("동기화된 홍채사진과 점을 불러왔습니다.");
    await toggleIrisSaveList(true);
  } catch (error) {
    console.warn("홍채사진 동기화 불러오기 실패", error);
    setIrisSaveStatus("동기화 불러오기에 실패했습니다.", true);
  }
});

closeIrisSaveListButton?.addEventListener("click", () => {
  toggleIrisSaveList(false);
});

resetIrisPointsButton?.addEventListener("click", () => {
  resetCurrentIrisPoints();
});

rightEyeZoomOutButton?.addEventListener("click", () => {
  zoomIrisView(0.86);
});

rightEyeZoomInButton?.addEventListener("click", () => {
  zoomIrisView(1.18);
});

leftEyeZoomOutButton?.addEventListener("click", () => {
  zoomIrisView(0.86);
});

leftEyeZoomInButton?.addEventListener("click", () => {
  zoomIrisView(1.18);
});

applyIrisViewScale();

eraserModeButton?.addEventListener("click", () => {
  state.eraserMode = !state.eraserMode;
  updateEraserModeButton();
});

irisSaveList?.addEventListener("click", (event) => {
  const loadButton = event.target.closest("[data-load-iris-save]");
  if (loadButton) {
    loadIrisSnapshot(loadButton.dataset.loadIrisSave);
    return;
  }
  const deleteButton = event.target.closest("[data-delete-iris-save]");
  if (deleteButton) {
    deleteIrisSnapshot(deleteButton.dataset.deleteIrisSave);
  }
});

exportButton?.addEventListener("click", () => {
  if (!canRunIrisAnalysis()) {
    renderAlignmentStatus();
    return;
  }
  runIrisReading();
});

let lineStartPoint = null;
let suppressCanvasClick = false;
const alignmentPointers = new Map();
let alignmentGesture = null;

canvas.addEventListener("pointerdown", (event) => {
  const hit = eventToCanvasPoint(event);
  const eye = state.eyes[hit.eyeKey];
  if (!eye?.image || eye.positionLocked) return;
  event.preventDefault();
  state.activeEye = hit.eyeKey;
  updateActiveEye();
  alignmentPointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY, eyeKey: hit.eyeKey, x: hit.x, y: hit.y });
  canvas.setPointerCapture?.(event.pointerId);
  canvas.classList.add("is-aligning");
  const sameEye = [...alignmentPointers.values()].filter((point) => point.eyeKey === hit.eyeKey);
  if (sameEye.length >= 2) {
    alignmentGesture = { type: "pinch", eyeKey: hit.eyeKey, distance: pointerDistance(sameEye[0], sameEye[1]) };
  } else {
    alignmentGesture = { type: "drag", eyeKey: hit.eyeKey, lastX: hit.x, lastY: hit.y };
  }
});

canvas.addEventListener("pointermove", (event) => {
  const previous = alignmentPointers.get(event.pointerId);
  if (!previous || !alignmentGesture) return;
  event.preventDefault();
  const hit = eventToCanvasPoint(event);
  alignmentPointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY, eyeKey: previous.eyeKey, x: hit.x, y: hit.y });
  const eye = state.eyes[alignmentGesture.eyeKey];
  if (!eye?.image || eye.positionLocked) return;
  const sameEye = [...alignmentPointers.values()].filter((point) => point.eyeKey === alignmentGesture.eyeKey);

  if (sameEye.length >= 2) {
    const distance = pointerDistance(sameEye[0], sameEye[1]);
    if (alignmentGesture.type !== "pinch") alignmentGesture = { type: "pinch", eyeKey: alignmentGesture.eyeKey, distance };
    const factor = clamp(distance / Math.max(1, alignmentGesture.distance), 0.86, 1.16);
    scaleEyePhotoInFrame(eye, factor);
    alignmentGesture.distance = distance;
  } else {
    const point = sameEye[0];
    if (!point) return;
    if (alignmentGesture.type !== "drag") alignmentGesture = { type: "drag", eyeKey: alignmentGesture.eyeKey, lastX: point.x, lastY: point.y };
    const dx = point.x - alignmentGesture.lastX;
    const dy = point.y - alignmentGesture.lastY;
    eye.imageBounds.x += dx;
    eye.imageBounds.y += dy;
    alignmentGesture.lastX = point.x;
    alignmentGesture.lastY = point.y;
  }

  suppressCanvasClick = true;
  refreshAlignmentConfidence(eye, true);
  syncControls();
  draw();
});

function finishAlignmentPointer(event) {
  if (!alignmentPointers.has(event.pointerId)) return;
  alignmentPointers.delete(event.pointerId);
  if (alignmentPointers.size === 0) {
    alignmentGesture = null;
    canvas.classList.remove("is-aligning");
    scheduleEyeStatePersistence(state.activeEye);
  } else {
    const point = [...alignmentPointers.values()][0];
    alignmentGesture = { type: "drag", eyeKey: point.eyeKey, lastX: point.x, lastY: point.y };
  }
}

canvas.addEventListener("pointerup", finishAlignmentPointer);
canvas.addEventListener("pointercancel", finishAlignmentPointer);

canvas.addEventListener("wheel", (event) => {
  const hit = eventToCanvasPoint(event);
  const eye = state.eyes[hit.eyeKey];
  if (!eye?.image || eye.positionLocked) return;
  event.preventDefault();
  state.activeEye = hit.eyeKey;
  scaleEyePhotoInFrame(eye, event.deltaY < 0 ? 1.05 : 0.95);
  suppressCanvasClick = true;
  refreshAlignmentConfidence(eye, true);
  syncControls();
  draw();
  scheduleEyeStatePersistence(hit.eyeKey);
}, { passive: false });

function pointerDistance(first, second) {
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
}

function scaleEyeForAlignment(eye, requestedFactor) {
  const minimumWidth = VIEW_WIDTH * 0.45;
  const maximumWidth = VIEW_WIDTH * 8;
  let factor = requestedFactor;
  if (eye.imageBounds.width * factor < minimumWidth) factor = minimumWidth / eye.imageBounds.width;
  if (eye.imageBounds.width * factor > maximumWidth) factor = maximumWidth / eye.imageBounds.width;
  const guideX = NORMALIZED_CENTER_X;
  const guideY = NORMALIZED_CENTER_Y;
  eye.imageBounds.x = guideX + (eye.imageBounds.x - guideX) * factor;
  eye.imageBounds.y = guideY + (eye.imageBounds.y - guideY) * factor;
  eye.imageBounds.width *= factor;
  eye.imageBounds.height *= factor;
  eye.imageBounds.scale *= factor;
  eye.centerX = guideX + (eye.centerX - guideX) * factor;
  eye.centerY = guideY + (eye.centerY - guideY) * factor;
  eye.pupilRadius *= factor;
  eye.irisRadius *= factor;
}

function scaleEyePhotoInFrame(eye, requestedFactor) {
  const minimumWidth = VIEW_WIDTH * 0.45;
  const maximumWidth = VIEW_WIDTH * 8;
  let factor = requestedFactor;
  if (eye.imageBounds.width * factor < minimumWidth) factor = minimumWidth / eye.imageBounds.width;
  if (eye.imageBounds.width * factor > maximumWidth) factor = maximumWidth / eye.imageBounds.width;

  const frame = getEyePhotoFrame();
  eye.imageBounds.x = frame.x + (eye.imageBounds.x - frame.x) * factor;
  eye.imageBounds.y = frame.y + (eye.imageBounds.y - frame.y) * factor;
  eye.imageBounds.width *= factor;
  eye.imageBounds.height *= factor;
  eye.imageBounds.scale *= factor;
}

canvas.addEventListener("click", (event) => {
  if (suppressCanvasClick) {
    suppressCanvasClick = false;
    return;
  }
  const hit = eventToCanvasPoint(event);

  if (hit.eyeKey) {
    state.activeEye = hit.eyeKey;
    updateActiveEye();
    syncControls();
  }

  const eye = currentEye();
  if (!eye.image) return;
  if (eye.alignmentMode) return;

  const point = { x: hit.x, y: hit.y };
  if (state.eraserMode) {
    const removed = eraseMarkerAtPoint(eye, point);
    if (removed) {
      renderSelection(null);
      renderManualObservations();
      renderManualObservationGuide(null);
      renderMarkers();
      renderDetailMap(null);
      draw();
      updateUiEnabled();
      scheduleEyeStatePersistence(state.activeEye);
    }
    return;
  }

  const match = resolvePoint(point.x, point.y);
  if (!match) return;

  const marker = createManualObservationMarker(point, match);
  eye.markers.push(marker);
  eye.selected = point;
  state.selectedObservationId = marker.id;
  state.manualObservationStrength = marker.strength;
  updateObservationStrengthButtons();
  renderSelection(match);
  renderManualObservations();
  renderManualObservationGuide(marker);
  renderMarkers();
  renderDetailMap(match);
  draw();
  scheduleEyeStatePersistence(state.activeEye);
});

async function setEyeImage(eyeKey, file) {
  const image = await loadImage(file);
  const eye = state.eyes[eyeKey];
  eye.fileName = file.name;
  eye.image = image;
  eye.sourceBlob = file;
  eye.firebaseImageSynced = false;
  eye.positionLocked = false;
  eye.markers = [];
  eye.selected = null;
  resetAndDetectEye(eye, eyeKey);
  eye.alignmentMode = true;
}

let eyePersistenceTimer = null;

function openEyePhotoDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("이 브라우저에서는 사진 저장소를 사용할 수 없습니다."));
      return;
    }

    const request = indexedDB.open(EYE_PHOTO_DB_NAME, EYE_PHOTO_DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(EYE_PHOTO_STORE_NAME)) {
        database.createObjectStore(EYE_PHOTO_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("사진 저장소를 열 수 없습니다."));
  });
}

function runEyePhotoStore(mode, operation) {
  return openEyePhotoDatabase().then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(EYE_PHOTO_STORE_NAME, mode);
    const store = transaction.objectStore(EYE_PHOTO_STORE_NAME);
    const request = operation(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("사진 저장 작업에 실패했습니다."));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => database.close();
    transaction.onabort = () => database.close();
  }));
}

function currentPhotoOwnerKey() {
  return normalizePhone(localStorage.getItem(AUTH_SESSION_KEY) || "");
}

function mappingOverlayStorageKey() {
  const ownerKey = currentPhotoOwnerKey() || "guest";
  return `${MAPPING_OVERLAY_KEY_PREFIX}:${ownerKey}`;
}

function eyeMarkerStorageKey(ownerKey, eyeKey) {
  return `${IRIS_EYE_MARKERS_KEY_PREFIX}:${ownerKey}:${eyeKey}`;
}

function persistMappingOverlayState() {
  try {
    localStorage.setItem(mappingOverlayStorageKey(), state.overlayVisible ? "1" : "0");
  } catch (_) {
    // 저장소 접근 실패 시에도 맵핑 기능 자체는 유지합니다.
  }
}

function restoreMappingOverlayState() {
  try {
    state.overlayVisible = localStorage.getItem(mappingOverlayStorageKey()) === "1";
  } catch (_) {
    state.overlayVisible = false;
  }
}

function eyePhotoRecordId(ownerKey, eyeKey) {
  return `${ownerKey}:${eyeKey}`;
}

function serializeEyeGeometry(eye) {
  return {
    imageBounds: { ...eye.imageBounds },
    centerX: eye.centerX,
    centerY: eye.centerY,
    pupilRadius: eye.pupilRadius,
    irisRadius: eye.irisRadius,
    rotation: eye.rotation || 0,
    positionLocked: Boolean(eye.positionLocked),
    alignmentSaved: !eye.alignmentMode,
    detection: { ...eye.detection },
    markers: serializeEyeMarkers(eye)
  };
}

function markerPositionRatio(eye, marker) {
  const bounds = eye.imageBounds || {};
  const width = Number(bounds.width) || VIEW_WIDTH;
  const height = Number(bounds.height) || VIEW_HEIGHT;
  const baseX = Number(bounds.x) || 0;
  const baseY = Number(bounds.y) || 0;
  return {
    xRatio: Number.isFinite(marker?.xRatio) ? marker.xRatio : clamp((Number(marker?.x || 0) - baseX) / width, 0, 1),
    yRatio: Number.isFinite(marker?.yRatio) ? marker.yRatio : clamp((Number(marker?.y || 0) - baseY) / height, 0, 1)
  };
}

function serializeEyeMarkers(eye) {
  return (Array.isArray(eye.markers) ? eye.markers : []).map((marker) => {
    const ratios = markerPositionRatio(eye, marker);
    return {
      ...marker,
      xRatio: Number(ratios.xRatio.toFixed(6)),
      yRatio: Number(ratios.yRatio.toFixed(6))
    };
  });
}

function restoreEyeMarkers(eye, markers) {
  return (Array.isArray(markers) ? markers : []).map((marker) => {
    const restored = { ...marker };
    if (Number.isFinite(restored.xRatio) && Number.isFinite(restored.yRatio)) {
      restored.x = Math.round((Number(eye.imageBounds?.x) || 0) + restored.xRatio * (Number(eye.imageBounds?.width) || VIEW_WIDTH));
      restored.y = Math.round((Number(eye.imageBounds?.y) || 0) + restored.yRatio * (Number(eye.imageBounds?.height) || VIEW_HEIGHT));
    } else {
      const ratios = markerPositionRatio(eye, restored);
      restored.xRatio = Number(ratios.xRatio.toFixed(6));
      restored.yRatio = Number(ratios.yRatio.toFixed(6));
    }
    return restored;
  });
}

function persistEyeMarkersToLocalStorage(ownerKey, eyeKey, eye) {
  if (!ownerKey) return;
  const key = eyeMarkerStorageKey(ownerKey, eyeKey);
  const markers = serializeEyeMarkers(eye);
  localStorage.setItem(key, JSON.stringify(markers));
  logIrisMarkerSync("markers:saved", ownerKey);
}

function readEyeMarkersFromLocalStorage(ownerKey, eyeKey) {
  if (!ownerKey) return [];
  try {
    return JSON.parse(localStorage.getItem(eyeMarkerStorageKey(ownerKey, eyeKey)) || "[]");
  } catch (_) {
    return [];
  }
}

function logIrisMarkerSync(context, ownerKey = currentPhotoOwnerKey()) {
  const uid = window.IrisFirebase?.getCurrentUser?.()?.uid || "";
  console.info("[IRIS marker sync]", context, {
    firebaseUid: uid || "not-signed-in",
    firestoreUserPath: uid ? `users/${uid}` : "",
    photoStore: "IndexedDB irisMappingPhotoStore/eyePhotos",
    rightPhotoRecord: eyePhotoRecordId(ownerKey || "guest", "right"),
    leftPhotoRecord: eyePhotoRecordId(ownerKey || "guest", "left"),
    rightEyeMarkersKey: ownerKey ? eyeMarkerStorageKey(ownerKey, "right") : "",
    leftEyeMarkersKey: ownerKey ? eyeMarkerStorageKey(ownerKey, "left") : "",
    rightEyeMarkersCount: state.eyes.right.markers.length,
    leftEyeMarkersCount: state.eyes.left.markers.length
  });
}

async function persistEyeState(eyeKey) {
  const ownerKey = currentPhotoOwnerKey();
  if (!ownerKey) return;

  const eye = state.eyes[eyeKey];
  const id = eyePhotoRecordId(ownerKey, eyeKey);

  try {
    if (!eye.image || !eye.sourceBlob) {
      await runEyePhotoStore("readwrite", (store) => store.delete(id));
      persistEyeMarkersToLocalStorage(ownerKey, eyeKey, eye);
      await persistEyeStateToFirebase(eyeKey, eye, { includeImage: false });
      return;
    }

    await runEyePhotoStore("readwrite", (store) => store.put({
      id,
      ownerKey,
      eyeKey,
      fileName: eye.fileName,
      blob: eye.sourceBlob,
      normalizedBlob: eye.normalizedBlob || null,
      geometry: serializeEyeGeometry(eye),
      updatedAt: new Date().toISOString()
    }));
    persistEyeMarkersToLocalStorage(ownerKey, eyeKey, eye);
    await persistEyeStateToFirebase(eyeKey, eye, { includeImage: !eye.firebaseImageSynced });
  } catch (error) {
    console.warn("홍채 사진을 저장하지 못했습니다.", error);
  }
}

async function persistEyeStateToFirebase(eyeKey, eye, options = {}) {
  const api = window.IrisFirebase;
  if (!api?.saveIrisEyeState || !api?.getCurrentUser?.()?.uid) return;
  const markers = serializeEyeMarkers(eye);
  try {
    await api.saveIrisEyeState({
      eyeKey,
      fileName: eye.fileName,
      blob: options.includeImage ? eye.sourceBlob : null,
      normalizedBlob: options.includeImage ? eye.normalizedBlob : null,
      geometry: serializeEyeGeometry(eye),
      markers
    });
    if (options.includeImage) eye.firebaseImageSynced = true;
  } catch (error) {
    console.warn("Firebase 홍채 사진/점 동기화에 실패했습니다.", error);
  }
}

function persistAllEyeStates() {
  return Promise.all([persistEyeState("right"), persistEyeState("left")]);
}

function scheduleEyeStatePersistence(eyeKey) {
  clearTimeout(eyePersistenceTimer);
  eyePersistenceTimer = setTimeout(() => persistEyeState(eyeKey), 250);
}

async function getStoredEyeRecord(ownerKey, eyeKey) {
  try {
    return await runEyePhotoStore("readonly", (store) => store.get(eyePhotoRecordId(ownerKey, eyeKey)));
  } catch (error) {
    console.warn("저장된 홍채 사진을 불러오지 못했습니다.", error);
    return null;
  }
}

async function loadImageFromBlob(blob) {
  const objectUrl = URL.createObjectURL(blob);
  try {
    return await loadImageFromSrc(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function restoreEyeGeometry(eye, geometry) {
  if (!geometry || !geometry.imageBounds) return false;
  const numericValues = [geometry.centerX, geometry.centerY, geometry.pupilRadius, geometry.irisRadius,
    geometry.imageBounds.x, geometry.imageBounds.y, geometry.imageBounds.width, geometry.imageBounds.height];
  if (!numericValues.every(Number.isFinite)) return false;

  eye.imageBounds = { ...geometry.imageBounds };
  eye.centerX = geometry.centerX;
  eye.centerY = geometry.centerY;
  eye.pupilRadius = geometry.pupilRadius;
  eye.irisRadius = geometry.irisRadius;
  eye.rotation = Number.isFinite(geometry.rotation) ? geometry.rotation : 0;
  eye.positionLocked = Boolean(geometry.positionLocked);
  eye.alignmentMode = geometry.alignmentSaved === false;
  eye.detection = geometry.detection && Number.isFinite(geometry.detection.alignmentConfidence)
    ? { ...geometry.detection }
    : { pupilConfidence: 0, irisConfidence: 0, alignmentConfidence: 0, status: "재검출 필요", manual: false };
  eye.markers = restoreEyeMarkers(eye, geometry.markers);
  return true;
}

async function createCompressedEyeDataUrl(eye) {
  if (!eye?.image) return "";
  const maxSizes = [760, 640, 520, 420];
  let lastDataUrl = "";
  for (const maxSize of maxSizes) {
    const sourceWidth = eye.image.naturalWidth || eye.image.width || maxSize;
    const sourceHeight = eye.image.naturalHeight || eye.image.height || maxSize;
    const scale = Math.min(1, maxSize / Math.max(sourceWidth, sourceHeight));
    const output = document.createElement("canvas");
    output.width = Math.max(1, Math.round(sourceWidth * scale));
    output.height = Math.max(1, Math.round(sourceHeight * scale));
    const outputContext = output.getContext("2d");
    outputContext.fillStyle = "#000";
    outputContext.fillRect(0, 0, output.width, output.height);
    outputContext.drawImage(eye.image, 0, 0, output.width, output.height);
    lastDataUrl = output.toDataURL("image/jpeg", 0.72);
    if (lastDataUrl.length < 380000) return lastDataUrl;
  }
  return lastDataUrl;
}

async function buildIrisSnapshotPayload() {
  const right = await buildIrisSnapshotEye("right");
  const left = await buildIrisSnapshotEye("left");
  const markerCount = (right.markers?.length || 0) + (left.markers?.length || 0);
  return {
    schemaVersion: 1,
    savedAt: new Date().toISOString(),
    storagePlan: {
      highResolutionStorage: "firebase-storage-later",
      currentImageStorage: "firestore-compressed-display-image"
    },
    right,
    left,
    summary: {
      rightMarkerCount: right.markers.length,
      leftMarkerCount: left.markers.length,
      markerCount,
      observationText: buildManualObservationText()
    }
  };
}

async function buildIrisSnapshotEye(eyeKey) {
  const eye = state.eyes[eyeKey];
  return {
    eyeKey,
    fileName: eye.fileName || "",
    hasImage: Boolean(eye.image),
    displayImage: await createCompressedEyeDataUrl(eye),
    geometry: serializeEyeGeometry(eye),
    markers: serializeEyeMarkers(eye)
  };
}

function buildManualObservationText() {
  return ["right", "left"].flatMap((eyeKey) => {
    const eyeLabel = state.map?.eyes?.[eyeKey]?.label || eyeKey;
    return (state.eyes[eyeKey].markers || []).map((marker) =>
      `${eyeLabel} ${marker.code || ""} ${marker.organ || ""} ${marker.type || ""} ${marker.clockTime || ""} ${marker.strength || ""}`.trim()
    );
  }).join("\n");
}

async function saveCurrentIrisSnapshot() {
  if (!window.IrisFirebase?.getCurrentUser?.()?.uid) {
    setIrisSaveStatus("로그인 후 저장할 수 있습니다.", true);
    return;
  }
  if (!state.eyes.right.image && !state.eyes.left.image) {
    setIrisSaveStatus("저장할 홍채사진이 없습니다.", true);
    return;
  }
  try {
    setIrisSaveStatus("저장 중입니다...");
    const payload = await buildIrisSnapshotPayload();
    await window.IrisFirebase.saveIrisSnapshot(payload);
    localStorage.setItem("irisSnapshotCache:lastSavedAt", payload.savedAt);
    setIrisSaveStatus("저장되었습니다.");
    await refreshIrisSnapshotList();
  } catch (error) {
    console.warn("홍채사진 저장 실패", error);
    setIrisSaveStatus("저장에 실패했습니다.", true);
  }
}

async function toggleIrisSaveList(forceOpen) {
  if (!irisSaveListPanel) return;
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : irisSaveListPanel.hidden;
  irisSaveListPanel.hidden = !shouldOpen;
  if (shouldOpen) await refreshIrisSnapshotList();
}

async function refreshIrisSnapshotList() {
  if (!irisSaveList) return;
  if (!window.IrisFirebase?.getCurrentUser?.()?.uid) {
    irisSaveList.innerHTML = `<p class="iris-save-empty">로그인 후 저장 목록을 볼 수 있습니다.</p>`;
    return;
  }
  try {
    const snapshots = await window.IrisFirebase.listIrisSnapshots();
    if (!snapshots.length) {
      irisSaveList.innerHTML = `<p class="iris-save-empty">저장된 홍채사진이 없습니다.</p>`;
      return;
    }
    irisSaveList.innerHTML = snapshots.map((item) => {
      const savedAt = formatIrisSnapshotDate(item.savedAt || item.createdAt);
      const count = item.summary?.markerCount ?? ((item.right?.markers?.length || 0) + (item.left?.markers?.length || 0));
      return `
        <article class="iris-save-item">
          <div>
            <strong>${savedAt}</strong>
            <span>점 ${count}개 · 우안 ${item.right?.hasImage ? "사진 있음" : "없음"} · 좌안 ${item.left?.hasImage ? "사진 있음" : "없음"}</span>
          </div>
          <div class="iris-save-item-actions">
            <button type="button" data-load-iris-save="${item.id}">불러오기</button>
            <button type="button" data-delete-iris-save="${item.id}">삭제</button>
          </div>
        </article>
      `;
    }).join("");
  } catch (error) {
    console.warn("저장된 홍채사진 목록 불러오기 실패", error);
    irisSaveList.innerHTML = `<p class="iris-save-empty">저장 목록을 불러오지 못했습니다.</p>`;
  }
}

async function loadIrisSnapshot(snapshotId) {
  if (!snapshotId || !window.IrisFirebase?.loadIrisSnapshot) return;
  try {
    setIrisSaveStatus("불러오는 중입니다...");
    const snapshot = await window.IrisFirebase.loadIrisSnapshot(snapshotId);
    if (!snapshot) {
      setIrisSaveStatus("저장본을 찾을 수 없습니다.", true);
      return;
    }
    await applyIrisSnapshot(snapshot);
    setIrisSaveStatus("불러왔습니다. 점만 초기화하면 같은 사진 위에 다시 표시할 수 있습니다.");
    toggleIrisSaveList(false);
  } catch (error) {
    console.warn("홍채사진 불러오기 실패", error);
    setIrisSaveStatus("불러오기에 실패했습니다.", true);
  }
}

async function applyIrisSnapshot(snapshot) {
  for (const eyeKey of ["right", "left"]) {
    const entry = snapshot[eyeKey];
    const eye = createEyeState();
    if (entry?.displayImage) {
      eye.fileName = entry.fileName || `${eyeKey}-iris`;
      eye.image = await loadImageFromSrc(entry.displayImage);
      eye.sourceBlob = await dataUrlToBlob(entry.displayImage);
      eye.firebaseImageSynced = true;
      if (!restoreEyeGeometry(eye, entry.geometry)) {
        resetAndDetectEye(eye, eyeKey);
        normalizeEyeView(eye, NORMALIZED_IRIS_RADIUS);
      }
      eye.markers = restoreEyeMarkers(eye, entry.markers || entry.geometry?.markers || []);
    }
    state.eyes[eyeKey] = eye;
  }
  state.activeEye = state.eyes.right.image ? "right" : state.eyes.left.image ? "left" : "right";
  state.selectedObservationId = null;
  updatePhotoNames();
  updateActiveEye();
  syncControls();
  renderSelection(null);
  renderMarkers();
  renderManualObservations();
  renderManualObservationGuide(null);
  renderDetailMap(null);
  draw();
  await persistAllEyeStates();
}

async function resetCurrentIrisPoints() {
  state.eyes.right.markers = [];
  state.eyes.left.markers = [];
  state.eyes.right.selected = null;
  state.eyes.left.selected = null;
  state.selectedObservationId = null;
  renderSelection(null);
  renderMarkers();
  renderManualObservations();
  renderManualObservationGuide(null);
  renderDetailMap(null);
  draw();
  updateUiEnabled();
  await persistAllEyeStates();
  setIrisSaveStatus("점과 관찰 설명을 초기화했습니다. 사진은 유지됩니다.");
}

async function deleteIrisSnapshot(snapshotId) {
  if (!snapshotId || !window.IrisFirebase?.deleteIrisSnapshot) return;
  try {
    await window.IrisFirebase.deleteIrisSnapshot(snapshotId);
    setIrisSaveStatus("저장본을 삭제했습니다.");
    await refreshIrisSnapshotList();
  } catch (error) {
    console.warn("저장된 홍채사진 삭제 실패", error);
    setIrisSaveStatus("삭제에 실패했습니다.", true);
  }
}

function setIrisSaveStatus(message, isError = false) {
  if (!irisSaveStatus) return;
  irisSaveStatus.textContent = message || "";
  irisSaveStatus.classList.toggle("is-error", Boolean(isError));
}

function formatIrisSnapshotDate(value) {
  const raw = value?.toDate ? value.toDate() : value;
  const date = raw ? new Date(raw) : new Date();
  if (Number.isNaN(date.getTime())) return "저장일 확인 안 됨";
  return date.toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
}

async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}

function setLargeIrisView(enabled, eyeKey = "right") {
  state.largeView = Boolean(enabled);
  state.largeEyeKey = eyeKey === "left" ? "left" : "right";
  document.body.classList.toggle("iris-large-mode", state.largeView);
  document.body.classList.toggle("iris-large-right", state.largeView && state.largeEyeKey === "right");
  document.body.classList.toggle("iris-large-left", state.largeView && state.largeEyeKey === "left");
  updateCanvasLayout();
  updateLargeViewButtons();
  draw();
}

function updateLargeViewButtons() {
  if (largeIrisViewButton) {
    largeIrisViewButton.textContent = state.largeView ? "크게 보기 닫기" : "크게 보기";
  }
}

function updateEraserModeButton() {
  if (!eraserModeButton) return;
  eraserModeButton.classList.toggle("is-active", state.eraserMode);
  eraserModeButton.textContent = state.eraserMode ? "지우개 켜짐" : "점 지우개";
}

function eraseMarkerAtPoint(eye, point) {
  const markers = Array.isArray(eye.markers) ? eye.markers : [];
  const hitRadius = state.largeView ? 18 : 13;
  let nearest = null;
  for (const marker of markers) {
    const distance = Math.hypot(Number(marker.x) - point.x, Number(marker.y) - point.y);
    if (distance <= hitRadius && (!nearest || distance < nearest.distance)) {
      nearest = { marker, distance };
    }
  }
  if (!nearest) {
    setIrisSaveStatus("지울 점을 찾지 못했습니다.");
    return false;
  }
  eye.markers = markers.filter((marker) => marker.id !== nearest.marker.id);
  if (state.selectedObservationId === nearest.marker.id) {
    state.selectedObservationId = null;
    eye.selected = null;
  }
  setIrisSaveStatus("선택한 점을 지웠습니다.");
  return true;
}

function zoomEyePhoto(eyeKey, factor) {
  const eye = state.eyes[eyeKey];
  if (!eye?.image) {
    setIrisSaveStatus(`${eyeKey === "left" ? "좌안" : "우안"} 사진이 없습니다.`);
    return;
  }
  state.activeEye = eyeKey;
  scaleEyePhotoInFrame(eye, factor);
  refreshAlignmentConfidence(eye, true);
  updateActiveEye();
  syncControls();
  draw();
  scheduleEyeStatePersistence(eyeKey);
}

function zoomIrisView(factor) {
  state.irisViewScale = clamp((state.irisViewScale || 1) * factor, 1, 2.4);
  localStorage.setItem("irisViewScale", String(state.irisViewScale));
  applyIrisViewScale();
}

function applyIrisViewScale() {
  if (!canvas) return;
  const rawScale = Number(state.irisViewScale);
  const scale = Number.isFinite(rawScale) ? clamp(rawScale, 1, 2.4) : 1;
  state.irisViewScale = scale;
  canvas.style.width = `${Math.round(scale * 100)}%`;
  canvas.style.maxWidth = scale > 1 ? "none" : "";
  canvas.classList.toggle("is-view-zoomed", scale > 1.01);
  canvas.parentElement?.classList.toggle("is-view-zoomed", scale > 1.01);
}

async function restoreSavedEyeImagesForCurrentUser(options = {}) {
  const ownerKey = currentPhotoOwnerKey();
  if (!ownerKey) return;
  const firebaseUid = window.IrisFirebase?.getCurrentUser?.()?.uid || "";
  console.info("[IRIS apply diagnostics:start]", {
    "1 Firebase Auth uid": firebaseUid || "not-signed-in",
    ownerKey,
    "9 화면에 apply() 호출 여부": "restoreSavedEyeImagesForCurrentUser 시작"
  });

  const records = await Promise.all([
    getStoredEyeRecord(ownerKey, "right"),
    getStoredEyeRecord(ownerKey, "left")
  ]);
  const firebaseAnalysis = await loadFirebaseEyeAnalysis(options.preferFirebase);
  console.info("[IRIS apply diagnostics:records]", {
    "5 rightEyeImage 존재 여부": Boolean(records[0]?.blob),
    "6 leftEyeImage 존재 여부": Boolean(records[1]?.blob),
    rightRecordId: eyePhotoRecordId(ownerKey, "right"),
    leftRecordId: eyePhotoRecordId(ownerKey, "left"),
    source: "IndexedDB irisMappingPhotoStore/eyePhotos"
  });

  for (const [index, eyeKey] of ["right", "left"].entries()) {
    let record = records[index];
    const firebaseRecord = firebaseAnalysis?.[eyeKey] || null;
    if (firebaseRecord?.blob) {
      record = firebaseRecord;
    }
    if (!record?.blob) continue;

    try {
      const eye = createEyeState();
      eye.fileName = record.fileName || `${eyeKey}-iris`;
      eye.sourceBlob = record.blob;
      eye.normalizedBlob = record.normalizedBlob || null;
      eye.image = await loadImageFromBlob(record.blob);
      eye.firebaseImageSynced = Boolean(record.fromFirebase);
      const geometryRestored = restoreEyeGeometry(eye, record.geometry);
      const hasSavedDetection = Number(eye.detection?.alignmentConfidence || 0) > 0;
      if (!geometryRestored || !hasSavedDetection) {
        resetAndDetectEye(eye, eyeKey);
        normalizeEyeView(eye, NORMALIZED_IRIS_RADIUS);
      }
      const remoteMarkers = readEyeMarkersFromLocalStorage(ownerKey, eyeKey);
      if (Array.isArray(record.remoteMarkers) && record.remoteMarkers.length) {
        eye.markers = restoreEyeMarkers(eye, record.remoteMarkers);
        persistEyeMarkersToLocalStorage(ownerKey, eyeKey, eye);
      } else if (remoteMarkers.length) {
        eye.markers = restoreEyeMarkers(eye, remoteMarkers);
      }
      console.info("[IRIS apply diagnostics:eye]", {
        eyeKey,
        applyCalled: true,
        fileName: eye.fileName,
        imageLoaded: Boolean(eye.image),
        imageNaturalSize: eye.image ? `${eye.image.width}x${eye.image.height}` : "",
        markerCount: eye.markers.length,
        geometryRestored,
        hasSavedDetection,
        localStorageMarkerKey: eyeMarkerStorageKey(ownerKey, eyeKey)
      });
      state.eyes[eyeKey] = eye;
    } catch (error) {
      console.warn(`${eyeKey} 홍채 사진 복원에 실패했습니다.`, error);
    }
  }

  state.activeEye = state.eyes.right.image ? "right" : state.eyes.left.image ? "left" : "right";
  updatePhotoNames();
  updateActiveEye();
  syncControls();
  renderSelection(null);
  renderMarkers();
  renderDetailMap(null);
  draw();
  const canvasElement = document.querySelector("#irisCanvas");
  console.info("[IRIS apply diagnostics:done]", {
    "7 rightEyeMarkers 개수": state.eyes.right.markers.length,
    "8 leftEyeMarkers 개수": state.eyes.left.markers.length,
    "9 화면에 apply() 호출 여부": true,
    "10 apply 후 이미지가 실제 DOM에 들어갔는지": {
      canvasExists: Boolean(canvasElement),
      rightEyeInState: Boolean(state.eyes.right.image),
      leftEyeInState: Boolean(state.eyes.left.image),
      canvasSize: canvasElement ? `${canvasElement.width}x${canvasElement.height}` : "",
      activeEye: state.activeEye
    }
  });
  logIrisMarkerSync("markers:restored", ownerKey);
}

async function loadFirebaseEyeAnalysis(shouldWait = false) {
  const api = window.IrisFirebase;
  if (!api?.loadIrisAnalysis) return null;
  if (shouldWait && !api.getCurrentUser?.()?.uid) {
    await waitForFirebaseUser();
  }
  if (!api.getCurrentUser?.()?.uid) return null;

  try {
    const analysis = await api.loadIrisAnalysis();
    if (!analysis) return null;
    const result = {};
    for (const eyeKey of ["right", "left"]) {
      const entry = analysis[eyeKey];
      if (!entry?.originalUrl) continue;
      const blob = await fetchBlob(entry.originalUrl);
      const normalizedBlob = entry.normalizedUrl ? await fetchBlob(entry.normalizedUrl).catch(() => null) : null;
      result[eyeKey] = {
        id: eyePhotoRecordId(currentPhotoOwnerKey(), eyeKey),
        ownerKey: currentPhotoOwnerKey(),
        eyeKey,
        fileName: entry.fileName || `${eyeKey}-iris`,
        blob,
        normalizedBlob,
        geometry: {
          ...(entry.geometry || {}),
          markers: Array.isArray(entry.markers) ? entry.markers : entry.geometry?.markers || []
        },
        remoteMarkers: Array.isArray(entry.markers) ? entry.markers : [],
        fromFirebase: true,
        updatedAt: entry.updatedAt || new Date().toISOString()
      };
      await runEyePhotoStore("readwrite", (store) => store.put(result[eyeKey])).catch(() => {});
    }
    return result;
  } catch (error) {
    console.warn("Firebase 홍채 사진/점 복원에 실패했습니다.", error);
    return null;
  }
}

function waitForFirebaseUser(timeoutMs = 5000) {
  const startedAt = Date.now();
  return new Promise((resolve) => {
    const tick = () => {
      if (window.IrisFirebase?.getCurrentUser?.()?.uid || Date.now() - startedAt > timeoutMs) {
        resolve();
        return;
      }
      setTimeout(tick, 120);
    };
    tick();
  });
}

async function fetchBlob(url) {
  const response = await fetch(url, { mode: "cors" });
  if (!response.ok) throw new Error(`이미지 다운로드 실패: ${response.status}`);
  return response.blob();
}

function clearEyeImagesFromMemory() {
  clearTimeout(eyePersistenceTimer);
  state.eyes.right = createEyeState();
  state.eyes.left = createEyeState();
  state.activeEye = "right";
  state.readingResults = null;
  state.collaretteObservations = {};
  updatePhotoNames();
  updateActiveEye();
  syncControls();
  renderSelection(null);
  renderMarkers();
  renderDetailMap(null);
  draw();
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });
}

function currentEye() {
  return state.eyes[state.activeEye];
}

function exportEye(eyeKey) {
  const eye = state.eyes[eyeKey];
  return {
    label: state.map.eyes[eyeKey].label,
    fileName: eye.fileName,
    geometry: {
      centerX: Math.round(eye.centerX),
      centerY: Math.round(eye.centerY),
      pupilRadius: Math.round(eye.pupilRadius),
      irisRadius: Math.round(eye.irisRadius)
    },
    markers: eye.markers
  };
}

function updateUiEnabled() {
  const enabled = Boolean(currentEye().image);
  for (const input of Object.values(controls)) input.disabled = !enabled;
  autoDetectButton.disabled = !enabled || Boolean(currentEye().alignmentMode);
  if (centerResetButton) centerResetButton.disabled = !enabled;
  if (alignmentSaveButton) {
    alignmentSaveButton.disabled = !enabled;
    const locked = Object.values(state.eyes).some((eye) => eye.image && eye.positionLocked);
    alignmentSaveButton.classList.toggle("is-locked", locked);
    alignmentSaveButton.textContent = locked ? "고정 해제" : "위치 고정";
  }
  updateOverlayButtonLabel();
  if (clearMarkersButton) clearMarkersButton.disabled = !enabled;
  if (saveIrisSessionButton) saveIrisSessionButton.disabled = !state.eyes.right.image && !state.eyes.left.image;
  if (resetIrisPointsButton) resetIrisPointsButton.disabled = !state.eyes.right.markers.length && !state.eyes.left.markers.length;
  if (exportButton) exportButton.disabled = !canRunIrisAnalysis();
  swapEyesButton.disabled = !state.eyes.right.image && !state.eyes.left.image;
  emptyState.hidden = Boolean(state.eyes.right.image || state.eyes.left.image);
  renderAlignmentStatus();
}

function canRunIrisAnalysis() {
  const loadedEyes = Object.values(state.eyes).filter((eye) => eye.image);
  return loadedEyes.length > 0
    && loadedEyes.every((eye) => !eye.alignmentMode)
    && loadedEyes.every((eye) => Number(eye.detection?.alignmentConfidence || 0) >= 85);
}

function renderAlignmentStatus() {
  if (!alignmentStatus || alignmentStatus.hidden) return;
  const rows = [["right", "우안"], ["left", "좌안"]].map(([eyeKey, label]) => {
    const eye = state.eyes[eyeKey];
    if (!eye.image) return `<div class="alignment-eye is-empty"><strong>${label}</strong><span>사진 없음</span></div>`;
    const detection = eye.detection || {};
    const confidence = Number(detection.alignmentConfidence || 0);
    const stateClass = confidence >= 85 ? "is-good" : "is-warning";
    return `<div class="alignment-eye ${stateClass}"><strong>${label}</strong><span>동공 ${Math.round(detection.pupilConfidence || 0)}%</span><span>외곽 ${Math.round(detection.irisConfidence || 0)}%</span><b>${confidence >= 85 ? `정렬 ${confidence}% · 양호` : `정렬 ${confidence}% · 재조정 필요`}</b></div>`;
  });
  const blocked = Object.values(state.eyes).some((eye) => eye.image && Number(eye.detection?.alignmentConfidence || 0) < 85);
  const aligning = Object.values(state.eyes).some((eye) => eye.image && eye.alignmentMode);
  alignmentStatus.innerHTML = `${rows.join("")}${aligning ? '<p>점선 원과 십자선에 맞춘 뒤 각 눈의 정렬을 저장해 주세요.</p>' : blocked ? '<p>정확도 85% 미만: 자동 분석이 잠겼습니다.</p>' : ""}`;
}

function updateActiveEye() {
  photoCards.forEach((item) => item.classList.toggle("active", item.dataset.eye === state.activeEye));
  updateUiEnabled();
  renderManualObservations();
}

function updatePhotoNames() {
  rightPhotoName.textContent = state.eyes.right.fileName || "사진 없음";
  leftPhotoName.textContent = state.eyes.left.fileName || "사진 없음";
}

function fitImageToCanvas(eye) {
  const maxWidth = VIEW_WIDTH;
  const maxHeight = VIEW_HEIGHT;
  const source = eye.image;
  const scale = Math.min(maxWidth / source.width, maxHeight / source.height);
  const width = source.width * scale;
  const height = source.height * scale;
  eye.imageBounds = {
    x: (maxWidth - width) / 2,
    y: (maxHeight - height) / 2,
    width,
    height,
    scale
  };
}

function resetAndDetectEye(eye, eyeKey = state.activeEye) {
  fitImageToCanvas(eye);
  autoDetectIris(eye, eyeKey);
}

function normalizePairView() {
  if (!state.eyes.right.image || !state.eyes.left.image) return;

  normalizeEyeView(state.eyes.right, NORMALIZED_IRIS_RADIUS);
  normalizeEyeView(state.eyes.left, NORMALIZED_IRIS_RADIUS);
}

function normalizeEyeView(eye, targetRadius) {
  if (!eye.image || !Number.isFinite(eye.irisRadius) || eye.irisRadius <= 0) return;

  const oldBounds = eye.imageBounds;
  const scale = targetRadius / eye.irisRadius;

  const imageCenterX = (eye.centerX - oldBounds.x) / oldBounds.width;
  const imageCenterY = (eye.centerY - oldBounds.y) / oldBounds.height;

  const width = oldBounds.width * scale;
  const height = oldBounds.height * scale;

  eye.imageBounds = {
    x: NORMALIZED_CENTER_X - imageCenterX * width,
    y: NORMALIZED_CENTER_Y - imageCenterY * height,
    width,
    height,
    scale: oldBounds.scale * scale
  };

  eye.centerX = NORMALIZED_CENTER_X;
  eye.centerY = NORMALIZED_CENTER_Y;

  eye.pupilRadius = Math.max(18, Math.min(eye.pupilRadius * scale, targetRadius * 0.45));

  eye.irisRadius = targetRadius;
  eye.markers = [];
  eye.selected = null;
  refreshAlignmentConfidence(eye, Boolean(eye.detection?.manual));
}

function pupilDiscContrastScore(imageData, x, y, radius) {
  const coreValues = [];
  const ringValues = [];
  const coreRadii = [0, radius * 0.28, radius * 0.52];
  const ringRadii = [radius * 0.92, radius * 1.16, radius * 1.4];

  for (const sampleRadius of coreRadii) {
    const samples = sampleRadius === 0 ? 1 : 16;
    for (let index = 0; index < samples; index += 1) {
      const angle = (Math.PI * 2 * index) / samples;
      coreValues.push(luminanceAt(
        imageData,
        x + Math.cos(angle) * sampleRadius,
        y + Math.sin(angle) * sampleRadius
      ));
    }
  }

  for (const sampleRadius of ringRadii) {
    for (let index = 0; index < 24; index += 1) {
      const angle = (Math.PI * 2 * index) / 24;
      const value = luminanceAt(
        imageData,
        x + Math.cos(angle) * sampleRadius,
        y + Math.sin(angle) * sampleRadius
      );
      if (value < 245) ringValues.push(value);
    }
  }

  if (coreValues.length < 20 || ringValues.length < 48) return -Infinity;
  const coreMean = averageNumber(coreValues);
  const ringMean = averageNumber(ringValues);
  const coreSpread = standardDeviation(coreValues, coreMean);
  const contrast = ringMean - coreMean;
  if (coreMean > 105 || contrast < 18) return -Infinity;

  return contrast * 1.3 + (105 - coreMean) * 0.18 - coreSpread * 0.28;
}

function findPupilDiscByContrast(imageData, bounds) {
  const minSide = Math.min(bounds.width, bounds.height);
  const minRadius = Math.max(12, minSide * 0.045);
  const maxRadius = Math.min(58, minSide * 0.16);
  const left = bounds.x + bounds.width * 0.1;
  const right = bounds.x + bounds.width * 0.9;
  const top = bounds.y + bounds.height * 0.18;
  const bottom = bounds.y + bounds.height * 0.82;
  let best = null;

  for (let y = top; y <= bottom; y += 4) {
    for (let x = left; x <= right; x += 4) {
      for (let radius = minRadius; radius <= maxRadius; radius += 4) {
        const score = pupilDiscContrastScore(imageData, x, y, radius);
        if (!best || score > best.score) best = { x, y, radius, score };
      }
    }
  }

  if (!best || !Number.isFinite(best.score)) return null;
  let refined = best;
  for (let y = best.y - 4; y <= best.y + 4; y += 1) {
    for (let x = best.x - 4; x <= best.x + 4; x += 1) {
      for (let radius = Math.max(minRadius, best.radius - 3); radius <= Math.min(maxRadius, best.radius + 3); radius += 1) {
        const score = pupilDiscContrastScore(imageData, x, y, radius);
        if (score > refined.score) refined = { x, y, radius, score };
      }
    }
  }

  return { x: refined.x, y: refined.y, radius: refined.radius, score: refined.score };
}

function refineRightPupilCenter(imageData, pupil) {
  const searchRadius = pupil.radius * 1.15;
  const values = [];

  for (let y = pupil.y - searchRadius; y <= pupil.y + searchRadius; y += 1) {
    for (let x = pupil.x - searchRadius; x <= pupil.x + searchRadius; x += 1) {
      if (Math.hypot(x - pupil.x, y - pupil.y) > searchRadius) continue;
      values.push(luminanceAt(imageData, x, y));
    }
  }

  if (values.length === 0) return pupil;
  const threshold = clamp(percentileNumber(values, 0.6), 35, 95);
  let count = 0;
  let totalX = 0;
  let totalY = 0;

  for (let y = pupil.y - searchRadius; y <= pupil.y + searchRadius; y += 1) {
    for (let x = pupil.x - searchRadius; x <= pupil.x + searchRadius; x += 1) {
      if (Math.hypot(x - pupil.x, y - pupil.y) > searchRadius) continue;
      if (luminanceAt(imageData, x, y) > threshold) continue;
      totalX += x;
      totalY += y;
      count += 1;
    }
  }

  if (count < 80) return pupil;
  const x = totalX / count;
  const y = totalY / count;
  if (Math.hypot(x - pupil.x, y - pupil.y) > pupil.radius * 0.38) return pupil;
  return { x, y, radius: pupil.radius, score: pupil.score };
}

function averageNumber(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values, mean) {
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function irisBoundaryScore(imageData, bounds, cx, cy, radius) {
  const scores = [];
  const angles = [];
  for (let degree = -55; degree <= 55; degree += 10) angles.push(degree);
  for (let degree = 125; degree <= 235; degree += 10) angles.push(degree);

  for (const degree of angles) {
    const angle = (degree * Math.PI) / 180;
    const innerX = cx + Math.cos(angle) * (radius - 5);
    const innerY = cy + Math.sin(angle) * (radius - 5);
    const outerX = cx + Math.cos(angle) * (radius + 5);
    const outerY = cy + Math.sin(angle) * (radius + 5);
    if (
      innerX < bounds.x || innerX > bounds.x + bounds.width ||
      innerY < bounds.y || innerY > bounds.y + bounds.height ||
      outerX < bounds.x || outerX > bounds.x + bounds.width ||
      outerY < bounds.y || outerY > bounds.y + bounds.height
    ) continue;

    const inner = colorSampleAt(imageData, innerX, innerY);
    const outer = colorSampleAt(imageData, outerX, outerY);
    if (inner.luminance > 242 || outer.luminance > 242) continue;
    const brightnessJump = outer.luminance - inner.luminance;
    const saturationDrop = inner.saturation - outer.saturation;
    scores.push(
      Math.max(0, brightnessJump) * 1.15 +
      Math.max(0, saturationDrop) * 85 +
      Math.abs(brightnessJump) * 0.18
    );
  }

  if (scores.length < 10) return -Infinity;
  return percentileNumber(scores, 0.55);
}

function findIrisRadiusByBoundary(imageData, bounds, cx, cy, pupilRadius) {
  const minSide = Math.min(bounds.width, bounds.height);
  const minRadius = Math.max(pupilRadius * 2.2, pupilRadius + 34);
  const maxRadius = minSide * 0.48;
  const candidates = [];

  for (let radius = minRadius; radius <= maxRadius; radius += 2) {
    const score = irisBoundaryScore(imageData, bounds, cx, cy, radius);
    if (Number.isFinite(score)) candidates.push({ radius, score });
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  if (best.score < 24) return null;
  const closeMatches = candidates
    .filter((item) => item.score >= best.score * 0.82)
    .map((item) => item.radius);
  return medianNumber(closeMatches);
}

function autoDetectIris(eye, eyeKey = state.activeEye) {
  drawImageOnly(eye);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const bounds = eye.imageBounds;
  const detectedPupil = findPupilDiscByContrast(imageData, bounds);
  const contrastPupil = detectedPupil && eyeKey === "right"
    ? refineRightPupilCenter(imageData, detectedPupil)
    : detectedPupil;
  const pupil = contrastPupil || findPupilRegion(imageData, bounds, eyeKey);
  const refinedPupil = contrastPupil || refinePupilCircle(imageData, pupil, bounds);

  eye.centerX = refinedPupil.x;
  eye.centerY = refinedPupil.y;

  const radial = [];
  const maxRadius = Math.min(bounds.width, bounds.height) * 0.49;
  for (let radius = 12; radius < maxRadius; radius += 3) {
    radial.push({ radius, value: averageRingLuminance(imageData, eye.centerX, eye.centerY, radius) });
  }

  const pupilEdge = strongestRise(radial, 12, maxRadius * 0.35);
  const irisEdge = strongestChange(radial, maxRadius * 0.62, maxRadius);
  eye.pupilRadius = clamp(refinedPupil.radius || pupilEdge || pupil.radius || maxRadius * 0.16, 18, maxRadius * 0.4);
  const boundaryEdge = findIrisRadiusByBoundary(
    imageData,
    bounds,
    eye.centerX,
    eye.centerY,
    eye.pupilRadius
  );
  const colorEdge = estimateIrisColorEdge(imageData, eye.centerX, eye.centerY, eye.pupilRadius + 50, maxRadius * 0.98);
  const rayEdge = estimateIrisRayEdge(imageData, eye.centerX, eye.centerY, eye.pupilRadius + 48, maxRadius * 0.96);
  const visibleEdge = estimateVisibleIrisEdge(imageData, eye.centerX, eye.centerY, eye.pupilRadius + 42, maxRadius * 0.98);
  const candidates = [irisEdge, colorEdge, rayEdge, visibleEdge].filter(Boolean);
  const estimatedOuter = boundaryEdge || (candidates.length > 0 ? percentileNumber(candidates, 0.72) : null);
  const maxIrisFromPupil = eye.pupilRadius * 4.35;
  eye.irisRadius = clamp(
    estimatedOuter || maxRadius * 0.82,
    eye.pupilRadius + 50,
    Math.min(maxRadius * 0.9, maxIrisFromPupil)
  );
  const pupilConfidence = detectedPupil
    ? clamp(72 + Math.max(0, Number(detectedPupil.score || 0)) * 0.22, 72, 98)
    : 62;
  const irisConfidence = boundaryEdge
    ? 93
    : candidates.length >= 3
      ? 88
      : candidates.length >= 1
        ? 78
        : 60;
  eye.detection = {
    pupilConfidence,
    irisConfidence,
    alignmentConfidence: 0,
    status: "검출 중",
    manual: false
  };
  refreshAlignmentConfidence(eye, false);
}

function refreshAlignmentConfidence(eye, manual = false) {
  if (!eye?.image) return 0;
  const bounds = eye.imageBounds;
  const availableRadius = Math.min(
    eye.centerX - bounds.x,
    bounds.x + bounds.width - eye.centerX,
    eye.centerY - bounds.y,
    bounds.y + bounds.height - eye.centerY
  );
  const visibleConfidence = clamp((availableRadius / Math.max(1, eye.irisRadius)) * 100, 0, 100);
  const pupilConfidence = Number(eye.detection?.pupilConfidence || 0);
  const irisConfidence = Number(eye.detection?.irisConfidence || 0);
  const geometryValid = eye.pupilRadius >= 12
    && eye.irisRadius > eye.pupilRadius + 35
    && eye.irisRadius <= Math.min(VIEW_WIDTH, VIEW_HEIGHT) * 0.49;
  const geometryPenalty = geometryValid ? 0 : 18;
  const alignmentConfidence = clamp(
    pupilConfidence * 0.5 + irisConfidence * 0.35 + visibleConfidence * 0.15 - geometryPenalty,
    0,
    98
  );
  eye.detection = {
    pupilConfidence,
    irisConfidence,
    alignmentConfidence,
    status: alignmentConfidence >= 85 ? "양호" : "홍채 위치 재조정 필요",
    manual: Boolean(manual)
  };
  return alignmentConfidence;
}

function findPupilRegion(imageData, bounds, eyeKey = state.activeEye) {
  const step = 2;
  const isLeftEye = eyeKey === "left";
  const left = bounds.x + bounds.width * (isLeftEye ? 0.08 : 0.14);
  const right = bounds.x + bounds.width * (isLeftEye ? 0.94 : 0.86);
  const top = bounds.y + bounds.height * 0.22;
  const bottom = bounds.y + bounds.height * 0.82;
  const samples = [];
  let darkest = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2, value: 255, raw: 255 };
  let rawDarkest = 255;

  for (let y = top; y <= bottom; y += step) {
    for (let x = left; x <= right; x += step) {
      const pixel = pixelAt(imageData, x, y);
      const value = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;
      rawDarkest = Math.min(rawDarkest, value);
      const dx = (x - (bounds.x + bounds.width / 2)) / bounds.width;
      const dy = (y - (bounds.y + bounds.height / 2)) / bounds.height;
      const centerBias = Math.sqrt(dx * dx + dy * dy) * (isLeftEye ? 30 : 42);
      const score = value + centerBias;
      if (score < darkest.value) darkest = { x, y, value: score, raw: value };
      samples.push({ x, y, value, score, ...pixel });
    }
  }

  const colorBlob = isLeftEye ? findBlueBlackPupilBlob(samples, bounds, step) : null;
  if (colorBlob) return colorBlob;

  const blobThreshold = Math.min(92, rawDarkest + 42);
  const blob = findDarkPupilBlob(samples, bounds, blobThreshold, step, eyeKey);
  if (blob) return blob;

  const threshold = Math.min(82, darkest.raw + 34);
  let weightTotal = 0;
  let xTotal = 0;
  let yTotal = 0;
  let darkCount = 0;
  for (const sample of samples) {
    const distanceFromDarkest = Math.hypot(sample.x - darkest.x, sample.y - darkest.y);
    if (sample.value <= threshold && distanceFromDarkest < Math.min(bounds.width, bounds.height) * 0.16) {
      const weight = Math.max(1, threshold - sample.value + 1);
      xTotal += sample.x * weight;
      yTotal += sample.y * weight;
      weightTotal += weight;
      darkCount += 1;
    }
  }

  if (weightTotal === 0) {
    return { x: darkest.x, y: darkest.y, radius: Math.min(bounds.width, bounds.height) * 0.08 };
  }

  const approximateArea = darkCount * step * step;
  return {
    x: xTotal / weightTotal,
    y: yTotal / weightTotal,
    radius: Math.sqrt(approximateArea / Math.PI)
  };
}

function findDarkPupilBlob(samples, bounds, threshold, step, eyeKey = state.activeEye) {
  const cellMap = new Map();
  for (const sample of samples) {
    if (sample.value > threshold) continue;
    const gx = Math.round((sample.x - bounds.x) / step);
    const gy = Math.round((sample.y - bounds.y) / step);
    cellMap.set(`${gx},${gy}`, { ...sample, gx, gy });
  }

  const visited = new Set();
  const components = [];
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  for (const [key, start] of cellMap) {
    if (visited.has(key)) continue;
    const queue = [start];
    visited.add(key);
    let count = 0;
    let totalX = 0;
    let totalY = 0;
    let totalWeight = 0;
    let minX = start.x;
    let maxX = start.x;
    let minY = start.y;
    let maxY = start.y;

    while (queue.length > 0) {
      const current = queue.pop();
      const weight = Math.max(1, threshold - current.value + 1);
      count += 1;
      totalX += current.x * weight;
      totalY += current.y * weight;
      totalWeight += weight;
      minX = Math.min(minX, current.x);
      maxX = Math.max(maxX, current.x);
      minY = Math.min(minY, current.y);
      maxY = Math.max(maxY, current.y);

      for (const [dx, dy] of directions) {
        const neighborKey = `${current.gx + dx},${current.gy + dy}`;
        if (!cellMap.has(neighborKey) || visited.has(neighborKey)) continue;
        visited.add(neighborKey);
        queue.push(cellMap.get(neighborKey));
      }
    }

    if (count < 30) continue;
    const width = Math.max(step, maxX - minX + step);
    const height = Math.max(step, maxY - minY + step);
    const aspect = Math.max(width, height) / Math.max(1, Math.min(width, height));
    const radius = Math.sqrt((count * step * step) / Math.PI);
    if (aspect > 2.1 || radius < 10 || radius > Math.min(bounds.width, bounds.height) * 0.22) continue;

    const x = totalX / totalWeight;
    const y = totalY / totalWeight;
    const centerX = bounds.x + bounds.width / 2;
    const centerDistance = Math.hypot(x - centerX, y - (bounds.y + bounds.height / 2));
    const leftEyeSideBonus = 0;
    const score = count
      - centerDistance * (eyeKey === "left" ? 0.04 : 0.08)
      - Math.abs(aspect - 1) * count * 0.35
      + leftEyeSideBonus;
    components.push({ x, y, radius, score });
  }

  if (components.length === 0) return null;
  components.sort((a, b) => b.score - a.score);
  const best = components[0];
  return { x: best.x, y: best.y, radius: best.radius };
}

function findBlueBlackPupilBlob(samples, bounds, step) {
  const cellMap = new Map();
  for (const sample of samples) {
    const blueBlack = sample.value < 125
      && sample.b > sample.r * 0.6
      && sample.g < sample.r * 1.2
      && sample.r < 130
      && sample.g < 135;
    if (!blueBlack) continue;
    const gx = Math.round((sample.x - bounds.x) / step);
    const gy = Math.round((sample.y - bounds.y) / step);
    cellMap.set(`${gx},${gy}`, { ...sample, gx, gy });
  }

  const visited = new Set();
  const candidates = [];
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  for (const [key, start] of cellMap) {
    if (visited.has(key)) continue;
    const queue = [start];
    visited.add(key);
    let count = 0;
    let totalX = 0;
    let totalY = 0;
    let minX = start.x;
    let maxX = start.x;
    let minY = start.y;
    let maxY = start.y;

    while (queue.length > 0) {
      const current = queue.pop();
      count += 1;
      totalX += current.x;
      totalY += current.y;
      minX = Math.min(minX, current.x);
      maxX = Math.max(maxX, current.x);
      minY = Math.min(minY, current.y);
      maxY = Math.max(maxY, current.y);

      for (const [dx, dy] of directions) {
        const neighborKey = `${current.gx + dx},${current.gy + dy}`;
        if (!cellMap.has(neighborKey) || visited.has(neighborKey)) continue;
        visited.add(neighborKey);
        queue.push(cellMap.get(neighborKey));
      }
    }

    if (count < 40) continue;
    const width = Math.max(step, maxX - minX + step);
    const height = Math.max(step, maxY - minY + step);
    const aspect = Math.max(width, height) / Math.max(1, Math.min(width, height));
    const radius = Math.sqrt((count * step * step) / Math.PI);
    const maxRadius = Math.min(bounds.width, bounds.height) * 0.18;
    if (aspect > 1.55 || radius < 12 || radius > maxRadius) continue;

    const x = totalX / count;
    const y = totalY / count;
    const centerX = bounds.x + bounds.width / 2;
    const centerDistance = Math.hypot(x - centerX, y - (bounds.y + bounds.height / 2));
    const targetRadius = Math.min(bounds.width, bounds.height) * 0.13;
    const score = count
      - Math.abs(aspect - 1) * count * 1.2
      - Math.abs(radius - targetRadius) * 10
      - centerDistance * 0.02;
    candidates.push({ x, y, radius, score });
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  return { x: best.x, y: best.y, radius: best.radius };
}

function refineLeftPupilByDisc(imageData, pupil, bounds) {
  const minSide = Math.min(bounds.width, bounds.height);
  const minRadius = Math.max(18, minSide * 0.07);
  const maxRadius = Math.min(44, minSide * 0.17);
  const searchLeft = Math.max(bounds.x + bounds.width * 0.12, pupil.x - minSide * 0.34);
  const searchRight = Math.min(bounds.x + bounds.width * 0.78, pupil.x + minSide * 0.12);
  const searchTop = Math.max(bounds.y + bounds.height * 0.18, pupil.y - minSide * 0.22);
  const searchBottom = Math.min(bounds.y + bounds.height * 0.72, pupil.y + minSide * 0.22);
  const candidates = [];

  for (let y = searchTop; y <= searchBottom; y += 2) {
    for (let x = searchLeft; x <= searchRight; x += 2) {
      for (let radius = minRadius; radius <= maxRadius; radius += 3) {
        const core = averageDiscLuminance(imageData, x, y, radius * 0.52);
        if (core > 82) continue;
        const ring = averageAnnulusLuminance(imageData, x, y, radius * 0.9, radius * 1.35);
        const contrast = ring - core;
        if (contrast < 26) continue;
        const distancePenalty = Math.hypot(x - pupil.x, y - pupil.y) * 0.05;
        const radiusPenalty = Math.abs(radius - minSide * 0.13) * 0.28;
        const score = contrast * 2.2 - core * 0.7 - distancePenalty - radiusPenalty;
        candidates.push({ x, y, radius, score });
      }
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates.slice(0, Math.min(6, candidates.length));
  const total = best.reduce((sum, item) => sum + Math.max(1, item.score + 120), 0);
  const x = best.reduce((sum, item) => sum + item.x * Math.max(1, item.score + 120), 0) / total;
  const y = best.reduce((sum, item) => sum + item.y * Math.max(1, item.score + 120), 0) / total;
  const radius = percentileNumber(best.map((item) => item.radius), 0.55);
  return { x, y, radius };
}

function refinePupilCircle(imageData, pupil, bounds) {
  const maxRadius = Math.min(bounds.width, bounds.height) * 0.22;
  const minRadius = Math.max(10, Math.min(pupil.radius * 0.45, maxRadius * 0.35));
  const centerWindow = Math.max(8, Math.min(18, pupil.radius * 0.4));
  const centerCandidates = [];

  for (let y = pupil.y - centerWindow; y <= pupil.y + centerWindow; y += 3) {
    for (let x = pupil.x - centerWindow; x <= pupil.x + centerWindow; x += 3) {
      const radius = estimatePupilRadiusByRays(imageData, x, y, minRadius, maxRadius);
      if (radius) {
        const darkness = 255 - averageDiscLuminance(imageData, x, y, Math.max(5, radius * 0.35));
        const centerPenalty = Math.hypot(x - pupil.x, y - pupil.y) * 0.7;
        centerCandidates.push({ x, y, radius, score: darkness - centerPenalty });
      }
    }
  }

  if (centerCandidates.length === 0) {
    const fallbackRadius = estimatePupilRadiusByRays(imageData, pupil.x, pupil.y, minRadius, maxRadius);
    return { x: pupil.x, y: pupil.y, radius: fallbackRadius || pupil.radius };
  }

  centerCandidates.sort((a, b) => b.score - a.score);
  const best = centerCandidates.slice(0, Math.min(8, centerCandidates.length));
  const total = best.reduce((sum, item) => sum + Math.max(1, item.score + 255), 0);
  const x = best.reduce((sum, item) => sum + item.x * Math.max(1, item.score + 255), 0) / total;
  const y = best.reduce((sum, item) => sum + item.y * Math.max(1, item.score + 255), 0) / total;
  const radius = percentileNumber(best.map((item) => item.radius), 0.55);
  return { x, y, radius };
}

function estimatePupilRadiusByRays(imageData, cx, cy, minRadius, maxRadius) {
  const centerDark = averageDiscLuminance(imageData, cx, cy, Math.max(4, minRadius * 0.45));
  const edges = [];

  for (let degree = 0; degree < 360; degree += 12) {
    const angle = (degree * Math.PI) / 180;
    let previous = centerDark;

    for (let radius = minRadius; radius <= maxRadius; radius += 2) {
      const value = luminanceAt(imageData, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      const riseFromCenter = value - centerDark;
      const riseFromPrevious = value - previous;
      if (riseFromCenter > 34 && riseFromPrevious > 8) {
        edges.push(radius);
        break;
      }
      previous = value;
    }
  }

  if (edges.length < 12) return null;
  return percentileNumber(edges, 0.48);
}

function averageDiscLuminance(imageData, cx, cy, radius) {
  let total = 0;
  let count = 0;
  const step = Math.max(2, Math.floor(radius / 4));

  for (let y = -radius; y <= radius; y += step) {
    for (let x = -radius; x <= radius; x += step) {
      if (x * x + y * y > radius * radius) continue;
      total += luminanceAt(imageData, cx + x, cy + y);
      count += 1;
    }
  }

  return count ? total / count : luminanceAt(imageData, cx, cy);
}

function averageAnnulusLuminance(imageData, cx, cy, innerRadius, outerRadius) {
  let total = 0;
  let count = 0;
  const step = Math.max(2, Math.floor(outerRadius / 5));
  const innerSq = innerRadius * innerRadius;
  const outerSq = outerRadius * outerRadius;

  for (let y = -outerRadius; y <= outerRadius; y += step) {
    for (let x = -outerRadius; x <= outerRadius; x += step) {
      const distSq = x * x + y * y;
      if (distSq < innerSq || distSq > outerSq) continue;
      total += luminanceAt(imageData, cx + x, cy + y);
      count += 1;
    }
  }

  return count ? total / count : luminanceAt(imageData, cx, cy);
}

function drawImageOnly(eye = currentEye()) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (!eye.image) return;
  const b = eye.imageBounds;
  ctx.drawImage(eye.image, b.x, b.y, b.width, b.height);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (state.largeView) {
    drawEyePanel(state.largeEyeKey || state.activeEye || "right", 0, 0);
    return;
  }
  if (state.stackedLayout) {
    drawEyePanel("right", 0, 0);
    drawEyePanel("left", 0, VIEW_HEIGHT);
  } else {
    drawEyePanel("right", 0, 0);
    drawEyePanel("left", VIEW_WIDTH, 0);
  }
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (state.stackedLayout) {
    ctx.moveTo(0, VIEW_HEIGHT);
    ctx.lineTo(VIEW_WIDTH, VIEW_HEIGHT);
  } else {
    ctx.moveTo(VIEW_WIDTH, 0);
    ctx.lineTo(VIEW_WIDTH, VIEW_HEIGHT);
  }
  ctx.stroke();
  ctx.restore();
}

function drawEyePanel(eyeKey, offsetX, offsetY = 0) {
  const eye = state.eyes[eyeKey];
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.beginPath();
  ctx.rect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.clip();
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  if (!eye.image) {
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.font = "800 28px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${state.map?.eyes[eyeKey]?.label || ""} 사진 없음`, VIEW_WIDTH / 2, VIEW_HEIGHT / 2);
    ctx.restore();
    return;
  }

  const b = eye.imageBounds;
  const frame = getEyePhotoFrame();
  ctx.save();
  ctx.beginPath();
  ctx.arc(frame.x, frame.y, frame.radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(eye.image, b.x, b.y, b.width, b.height);
  ctx.restore();
  drawEyePhotoFrame(frame);
  if (eye.alignmentMode) {
    drawCircularAlignmentGuide();
  } else if (state.map && state.overlayVisible) {
    drawIrisOverlay(eye, eyeKey);
  }
  drawMarkers(eye);
  ctx.restore();
}

function getEyePhotoFrame() {
  return {
    x: VIEW_WIDTH / 2,
    y: VIEW_HEIGHT / 2,
    radius: Math.min(VIEW_HEIGHT * 0.46, VIEW_WIDTH * 0.42)
  };
}

function drawEyePhotoFrame(frame) {
  ctx.save();
  ctx.strokeStyle = "rgba(54, 232, 220, 0.38)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(frame.x, frame.y, frame.radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 214, 112, 0.28)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(frame.x, frame.y, frame.radius + 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawCircularAlignmentGuide() {
  const cx = NORMALIZED_CENTER_X;
  const cy = NORMALIZED_CENTER_Y;
  const radius = NORMALIZED_IRIS_RADIUS;
  ctx.save();
  ctx.setLineDash([9, 7]);
  ctx.strokeStyle = "rgba(54, 232, 220, 0.98)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(255, 214, 112, 0.95)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 20, cy);
  ctx.lineTo(cx + 20, cy);
  ctx.moveTo(cx, cy - 20);
  ctx.lineTo(cx, cy + 20);
  ctx.stroke();
  ctx.fillStyle = "rgba(3, 8, 12, 0.72)";
  ctx.fillRect(cx - 118, cy + radius + 14, 236, 28);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 13px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("드래그 이동 · 핀치/휠 확대축소", cx, cy + radius + 28);
  ctx.restore();
}

function createNormalizedIrisBlob(eye) {
  const size = 512;
  const guideRadius = NORMALIZED_IRIS_RADIUS;
  const cropLeft = NORMALIZED_CENTER_X - guideRadius;
  const cropTop = NORMALIZED_CENTER_Y - guideRadius;
  const scale = size / (guideRadius * 2);
  const output = document.createElement("canvas");
  output.width = size;
  output.height = size;
  const outputContext = output.getContext("2d");
  outputContext.fillStyle = "#000";
  outputContext.fillRect(0, 0, size, size);
  outputContext.save();
  outputContext.beginPath();
  outputContext.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  outputContext.clip();
  outputContext.drawImage(
    eye.image,
    (eye.imageBounds.x - cropLeft) * scale,
    (eye.imageBounds.y - cropTop) * scale,
    eye.imageBounds.width * scale,
    eye.imageBounds.height * scale
  );
  outputContext.restore();
  return new Promise((resolve, reject) => output.toBlob((blob) => blob ? resolve(blob) : reject(new Error("정규화 이미지 생성 실패")), "image/jpeg", 0.94));
}

function updateOverlayButtonLabel() {
  if (!autoDetectButton) return;
  autoDetectButton.textContent = state.overlayVisible ? "맵핑 숨기기" : "맵핑하기";
}

function drawIrisOverlay(eye, eyeKey = state.activeEye) {
  const frame = getEyePhotoFrame();
  const cx = frame.x;
  const cy = frame.y;
  const iris = frame.radius;
  const pupil = iris * 0.22;
  const rotation = Number(eye.rotation || 0);

  ctx.save();
  drawColoredZones({ ...eye, centerX: cx, centerY: cy, pupilRadius: pupil, irisRadius: iris });
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,255,0.86)";
  circle(cx, cy, iris);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,206,108,0.92)";
  circle(cx, cy, pupil);
  ctx.stroke();

  for (let i = 0; i < 12; i += 1) {
    const angle = ((i * 30 - 90 + rotation) * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * pupil, cy + Math.sin(angle) * pupil);
    ctx.lineTo(cx + Math.cos(angle) * iris, cy + Math.sin(angle) * iris);
    ctx.strokeStyle = i % 3 === 0 ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.36)";
    ctx.lineWidth = i % 3 === 0 ? 2 : 1;
    ctx.stroke();
  }

  for (let ring = 1; ring <= 6; ring += 1) {
    const radius = pupil + ((iris - pupil) * ring) / 6;
    ctx.beginPath();
    circle(cx, cy, radius);
    ctx.strokeStyle = ring === 6 ? "rgba(255,255,255,0.66)" : "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "700 14px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let hour = 1; hour <= 12; hour += 1) {
    const angle = (((hour % 12) * 30 - 90 + rotation) * Math.PI) / 180;
    const labelRadius = iris + 10;
    ctx.fillText(`${hour}시`, cx + Math.cos(angle) * labelRadius, cy + Math.sin(angle) * labelRadius);
  }

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "800 18px Segoe UI, sans-serif";
  ctx.fillText(state.map.eyes[eyeKey].label, 54, 42);
  ctx.restore();
}

function drawColoredZones(eye) {
  const cx = eye.centerX;
  const cy = eye.centerY;
  const inner = eye.pupilRadius + (eye.irisRadius - eye.pupilRadius) * 0.18;
  const outer = eye.irisRadius;
  const rotation = Number(eye.rotation || 0);

  for (let hour = 1; hour <= 12; hour += 1) {
    const hourLabel = `${hour}시`;
    const style = zoneStyles[hourLabel] || { color: "#ffffff" };
    const centerDeg = (hour % 12) * 30 - 90 + rotation;
    const start = ((centerDeg - 14) * Math.PI) / 180;
    const end = ((centerDeg + 14) * Math.PI) / 180;
    ctx.beginPath();
    ctx.arc(cx, cy, outer, start, end);
    ctx.arc(cx, cy, inner, end, start, true);
    ctx.closePath();
    ctx.fillStyle = hexToRgba(style.color, 0.24);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawMarkers(eye = currentEye()) {
  ctx.save();
  eye.markers.forEach((marker, index) => {
    ctx.beginPath();
    ctx.arc(marker.x, marker.y, marker.id === state.selectedObservationId ? 7 : 5, 0, Math.PI * 2);
    ctx.fillStyle = marker.id === state.selectedObservationId ? "rgba(215,174,74,0.98)" : "rgba(55,214,205,0.96)";
    ctx.fill();
    ctx.lineWidth = marker.id === state.selectedObservationId ? 3 : 2;
    ctx.strokeStyle = marker.id === state.selectedObservationId ? "#fff2b8" : "rgba(0,0,0,0.72)";
    ctx.stroke();
  });
  ctx.restore();
}

function resolvePoint(x, y) {
  const eye = currentEye();
  const dx = x - eye.centerX;
  const dy = y - eye.centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < eye.pupilRadius || distance > eye.irisRadius) return null;

  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const clockAngle = (angle + 90 - Number(eye.rotation || 0) + 360) % 360;
  const hour = Math.floor((clockAngle + 15) / 30) % 12 || 12;
  const ring = clamp(Math.ceil(((distance - eye.pupilRadius) / (eye.irisRadius - eye.pupilRadius)) * 6), 1, 6);
  const hourLabel = `${hour}시`;
  const code = `${hour}-${ring}`;
  const regions = state.map.eyes[state.activeEye].regions;
  const exact = regions.find((region) => region.code === code);
  const fallback = regions.find((region) => region.hour === hourLabel);
  const region = exact || fallback;
  if (!region) return null;

  return {
    eye: state.map.eyes[state.activeEye].label,
    hour: hourLabel,
    clockTime: getClockTimeLabel(clockAngle, hour),
    ring,
    code: region.code,
    organ: region.organ,
    angle: Math.round(clockAngle),
    radiusRatio: Number(((distance - eye.pupilRadius) / (eye.irisRadius - eye.pupilRadius)).toFixed(3)),
    riskScore: state.map.riskScores[hourLabel] || null
  };
}

function getClockTimeLabel(clockAngle, hour) {
  const centerDeg = (hour % 12) * 30;
  const sectorStart = (centerDeg - 15 + 360) % 360;
  const progress = (clockAngle - sectorStart + 360) % 360;
  const minute = clamp(Math.round((Math.min(progress, 30) / 30) * 60), 0, 59);
  return `${hour}시 ${minute}분`;
}

function createManualObservationMarker(point, match) {
  const pattern = state.manualObservationType || "DOT";
  const strength = state.manualObservationStrength || "중";
  const ratios = markerPositionRatio(currentEye(), point);
  return {
    id: createObservationId(),
    type: manualObservationLabels[pattern] || "점",
    pattern,
    strength,
    x: Math.round(point.x),
    y: Math.round(point.y),
    xRatio: Number(ratios.xRatio.toFixed(6)),
    yRatio: Number(ratios.yRatio.toFixed(6)),
    clockTime: match.clockTime,
    radiusPercent: Math.round(match.radiusRatio * 100),
    ...match
  };
}

function createObservationId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `obs-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function resolveLinePath(start, end, steps = 80) {
  const results = [];
  const seen = new Set();

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = start.x + (end.x - start.x) * t;
    const y = start.y + (end.y - start.y) * t;

    const match = resolvePoint(x, y);
    if (!match) continue;

    if (!seen.has(match.code)) {
      seen.add(match.code);
      results.push(match);
    }
  }

  return results;
}

function getRegionsByHour(hourLabel) {
  return state.map.eyes[state.activeEye].regions.filter((region) => region.hour === hourLabel);
}

function renderSelection(match) {
  if (!selectionDetails || selectionDetails.hidden) return;
  if (!match) {
    selectionDetails.innerHTML = "<p>홍채의 선, 점, 색 변화 위치를 클릭하세요.</p>";
    return;
  }

  selectionDetails.innerHTML = `
    <dl>
      <dt>정밀 위치</dt><dd><strong>${match.code}</strong></dd>
      <dt>눈</dt><dd>${match.eye}</dd>
      <dt>시계 위치</dt><dd>${match.clockTime || match.hour}</dd>
      <dt>세부 링</dt><dd>${match.ring}번</dd>
      <dt>기관</dt><dd>${match.organ}</dd>
      ${match.strength ? `<dt>강도</dt><dd>${match.strength}</dd>` : ""}
      ${Number.isFinite(match.radiusPercent) ? `<dt>반경</dt><dd>${match.radiusPercent}%</dd>` : ""}
      <dt>각도</dt><dd>${match.angle}도</dd>
    </dl>
  `;
}

function renderDetailMap(match) {
  if (!detailMap || detailMap.hidden) return;
  if (!state.map) return;
  const hourLabel = match?.hour || "3시";
  const style = zoneStyles[hourLabel] || zoneStyles["3시"];
  const regions = getRegionsByHour(hourLabel);
  const focused = match ? `${match.code} ${match.organ}` : "영역을 클릭하면 해당 부위가 강조됩니다.";

  detailMap.innerHTML = `
    <div class="zone-head" style="border-color:${style.color}">
      <span class="zone-swatch" style="background:${style.color}"></span>
      <div>
        <strong>${hourLabel} ${style.group}</strong>
        <p>${style.note}</p>
      </div>
    </div>
    <div class="focus-line">${focused}</div>
    <div class="region-table">
      ${regions
        .map(
          (region) => `
            <div class="${match?.code === region.code ? "is-selected" : ""}">
              <span>${region.code}</span>
              <b>${region.organ}</b>
            </div>
          `
        )
        .join("")}
    </div>
    <div class="sign-grid">
      ${signExamples
        .map(
          (item) => `
            <div>
              <strong>${item.name}</strong>
              <span>${item.text}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderMarkers() {
  if (!markerList || markerList.hidden) return;
  const markers = currentEye().markers;

  if (markers.length === 0) {
    markerList.className = "marker-list empty";
    markerList.textContent = "아직 기록된 선 위치가 없습니다.";
    return;
  }

  markerList.className = "marker-list";

  markerList.innerHTML = markers.map((marker, index) => {
    if (marker.type === "선") {
      return `
        <div class="marker-item">
          <strong>${index + 1}. 선 통과 위치</strong>
          <span>${marker.codes.join(" → ")}</span>
        </div>
      `;
    }

    return `
      <div class="marker-item">
        <strong>${index + 1}. ${marker.code}</strong>
        <span>${marker.eye} · ${marker.organ}</span>
      </div>
    `;
  }).join("");
}
function renderAutoAnalysis() {
  const rightMarkers = state.eyes.right.markers;
  const leftMarkers = state.eyes.left.markers;

  selectionDetails.innerHTML = `
    <div>
      <h3>자동추정 결과</h3>
      ${renderEyeAnalysisBlock("우안", rightMarkers)}
      ${renderEyeAnalysisBlock("좌안", leftMarkers)}
    </div>
  `;

  markerList.className = "marker-list";
  markerList.innerHTML = `
    ${renderMarkerSummary("우안", rightMarkers)}
    ${renderMarkerSummary("좌안", leftMarkers)}
  `;
}

function renderEyeAnalysisBlock(label, markers) {
  if (!markers || markers.length === 0) {
    return `
      <div>
        <strong>${label}</strong>
        <p>기록된 선/점/색 변화가 없습니다.</p>
      </div>
    `;
  }

  return `
    <div>
      <strong>${label}</strong>
      <ul>
        ${markers.map((marker) => renderAnalysisItem(marker)).join("")}
      </ul>
    </div>
  `;
}

function renderAnalysisItem(marker) {
  if (marker.type === "선") {
    return `
      <li>
        <b>선</b> :
        ${marker.codes.join(" → ")}
      </li>
    `;
  }

  return `
    <li>
      <b>${marker.type || "점"}</b> :
      ${marker.code} / ${marker.organ}
    </li>
  `;
}

function renderMarkerSummary(label, markers) {
  if (!markers || markers.length === 0) {
    return `
      <div class="marker-item">
        <strong>${label}</strong>
        <span>기록 없음</span>
      </div>
    `;
  }

  return markers.map((marker, index) => {
    if (marker.type === "선") {
      return `
        <div class="marker-item">
          <strong>${label} ${index + 1}. 선</strong>
          <span>${marker.codes.join(" → ")}</span>
        </div>
      `;
    }

    return `
      <div class="marker-item">
        <strong>${label} ${index + 1}. ${marker.type || "점"}</strong>
        <span>${marker.code} · ${marker.organ}</span>
      </div>
    `;
  }).join("");
}

function syncControls() {
  const eye = currentEye();
  controls.centerX.value = Math.round(eye.centerX);
  controls.centerY.value = Math.round(eye.centerY);
  controls.pupilRadius.value = Math.round(eye.pupilRadius);
  controls.irisRadius.value = Math.round(eye.irisRadius);
  controls.rotation.value = Math.round(eye.rotation || 0);
  renderAlignmentStatus();
}

function eventToCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const cssX = event.clientX - rect.left;
  const cssY = event.clientY - rect.top;
  const rawX = clamp((cssX / rect.width) * canvas.width, 0, canvas.width);
  const rawY = clamp((cssY / rect.height) * canvas.height, 0, canvas.height);
  if (state.largeView) {
    return {
      eyeKey: state.largeEyeKey || state.activeEye || "right",
      x: clamp(rawX, 0, VIEW_WIDTH),
      y: clamp(rawY, 0, VIEW_HEIGHT)
    };
  }
  if (state.stackedLayout) {
    const eyeKey = rawY < VIEW_HEIGHT ? "right" : "left";
    return {
      eyeKey,
      x: clamp(rawX, 0, VIEW_WIDTH),
      y: clamp(rawY - (eyeKey === "left" ? VIEW_HEIGHT : 0), 0, VIEW_HEIGHT)
    };
  }
  const eyeKey = rawX < VIEW_WIDTH ? "right" : "left";
  return {
    eyeKey,
    x: clamp(rawX - (eyeKey === "left" ? VIEW_WIDTH : 0), 0, VIEW_WIDTH),
    y: clamp(rawY, 0, VIEW_HEIGHT)
  };
}

function luminanceAt(imageData, x, y) {
  const pixel = pixelAt(imageData, x, y);
  return pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;
}

function pixelAt(imageData, x, y) {
  const px = Math.max(0, Math.min(imageData.width - 1, Math.round(x)));
  const py = Math.max(0, Math.min(imageData.height - 1, Math.round(y)));
  const index = (py * imageData.width + px) * 4;
  const data = imageData.data;
  return { r: data[index], g: data[index + 1], b: data[index + 2] };
}

function averageRingLuminance(imageData, cx, cy, radius) {
  let total = 0;
  let count = 0;
  for (let degree = 0; degree < 360; degree += 8) {
    const angle = (degree * Math.PI) / 180;
    total += luminanceAt(imageData, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    count += 1;
  }
  return total / count;
}

function strongestRise(radial, minRadius, maxRadius) {
  let best = null;
  for (let i = 1; i < radial.length; i += 1) {
    const prev = radial[i - 1];
    const curr = radial[i];
    if (curr.radius < minRadius || curr.radius > maxRadius) continue;
    const diff = curr.value - prev.value;
    if (!best || diff > best.diff) best = { radius: curr.radius, diff };
  }
  return best?.radius;
}

function strongestChange(radial, minRadius, maxRadius) {
  let best = null;
  for (let i = 1; i < radial.length; i += 1) {
    const prev = radial[i - 1];
    const curr = radial[i];
    if (curr.radius < minRadius || curr.radius > maxRadius) continue;
    const diff = Math.abs(curr.value - prev.value);
    if (!best || diff > best.diff) best = { radius: curr.radius, diff };
  }
  return best?.radius;
}

function estimateIrisColorEdge(imageData, cx, cy, minRadius, maxRadius) {
  const samples = [];
  for (let radius = minRadius; radius < maxRadius; radius += 4) {
    let colorTotal = 0;
    let brightTotal = 0;
    let count = 0;

    for (let degree = 0; degree < 360; degree += 12) {
      const angle = (degree * Math.PI) / 180;
      const sample = colorSampleAt(imageData, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      colorTotal += sample.saturation;
      brightTotal += sample.luminance;
      count += 1;
    }

    samples.push({
      radius,
      saturation: colorTotal / count,
      luminance: brightTotal / count
    });
  }

  for (let i = 2; i < samples.length; i += 1) {
    const previous = samples[i - 2];
    const current = samples[i];
    const saturationDrop = previous.saturation - current.saturation;
    const brightJump = current.luminance - previous.luminance;
    if (current.radius > minRadius + 36 && saturationDrop > 0.08 && brightJump > 18) {
      return current.radius;
    }
  }

  return null;
}

function estimateIrisRayEdge(imageData, cx, cy, minRadius, maxRadius) {
  const edges = [];

  for (let degree = 0; degree < 360; degree += 6) {
    const angle = (degree * Math.PI) / 180;
    let previous = null;

    for (let radius = minRadius; radius < maxRadius; radius += 4) {
      const sample = colorSampleAt(imageData, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      if (!previous) {
        previous = sample;
        continue;
      }

      const brightSclera = sample.luminance > 150 && sample.saturation < 0.36;
      const darkLimbus = sample.luminance < 72 && radius > minRadius + 44;
      const colorToWhite = previous.saturation - sample.saturation > 0.12 && sample.luminance - previous.luminance > 12;

      if (radius > minRadius + 28 && (brightSclera || darkLimbus || colorToWhite)) {
        edges.push(radius);
        break;
      }

      previous = sample;
    }
  }

  if (edges.length < 8) return null;
  edges.sort((a, b) => a - b);
  return edges[Math.floor(edges.length * 0.62)];
}

function estimateVisibleIrisEdge(imageData, cx, cy, minRadius, maxRadius) {
  const edges = [];

  for (let degree = 0; degree < 360; degree += 5) {
    const angle = (degree * Math.PI) / 180;
    const verticalWeight = Math.abs(Math.sin(angle));
    if (verticalWeight > 0.94) continue;

    let previous = null;
    let best = null;

    for (let radius = minRadius; radius < maxRadius; radius += 3) {
      const sample = colorSampleAt(imageData, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      if (!previous) {
        previous = sample;
        continue;
      }

      const saturationDrop = previous.saturation - sample.saturation;
      const brightJump = sample.luminance - previous.luminance;
      const sclera = sample.luminance > 138 && sample.saturation < 0.34;
      const limbus = sample.luminance < 68 && previous.saturation > 0.25;
      const strongTransition = saturationDrop > 0.1 && brightJump > 8;

      if (radius > minRadius + 18 && (sclera || limbus || strongTransition)) {
        best = radius;
        break;
      }

      previous = sample;
    }

    if (best) edges.push(best);
  }

  if (edges.length < 12) return null;
  return percentileNumber(edges, 0.68);
}

function colorSampleAt(imageData, x, y) {
  const px = Math.max(0, Math.min(imageData.width - 1, Math.round(x)));
  const py = Math.max(0, Math.min(imageData.height - 1, Math.round(y)));
  const index = (py * imageData.width + px) * 4;
  const data = imageData.data;
  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return {
    luminance: r * 0.2126 + g * 0.7152 + b * 0.0722,
    saturation: max === 0 ? 0 : (max - min) / max
  };
}

function circle(x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function medianNumber(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function percentileNumber(values, ratio) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.min(sorted.length - 1, Math.round((sorted.length - 1) * ratio)));
  return sorted[index];
}

function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImageFromSrc(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function manualStrengthScore(strength) {
  return ({
    "약": 35,
    "중": 58,
    "강": 76,
    "매우강": 90
  })[strength] || 58;
}

function manualPatternWeight(pattern) {
  return ({
    DOT: 2,
    LINE: 3,
    LACUNA: 5,
    FIBER_SPREAD: 2,
    PIGMENT: 4,
    RING: 1,
    FIBER_BREAK: 5,
    IRREGULAR: 4
  })[pattern] || 2;
}

function buildManualObservationReading(eyeKey) {
  const eye = state.eyes?.[eyeKey];
  const markers = Array.isArray(eye?.markers) ? eye.markers : [];
  return markers.map((marker, index) => {
    const code = marker.code || `${marker.hour || ""}-${marker.ring || ""}`;
    const info = typeof irisOrganDB !== "undefined" ? irisOrganDB[code] : null;
    const area = marker.organ || info?.title || code || "관찰 영역";
    const type = marker.type || manualObservationLabels[marker.pattern] || "점";
    const score = manualStrengthScore(marker.strength);
    const consultation = `${marker.clockTime || `${marker.hour || ""}시`} 위치(${code})에서 ${buildObservationMeaningSentence(area, marker)}`;
    return {
      ...marker,
      rank: index + 1,
      eyeKey,
      eyeLabel: eyeKey === "right" ? "우안" : "좌안",
      code,
      area,
      type,
      score,
      priorityScore: manualPatternWeight(marker.pattern) * 10 + score,
      consultation
    };
  }).sort((a, b) => manualMarkerSortValue(a) - manualMarkerSortValue(b) || manualMarkerMinute(a) - manualMarkerMinute(b) || a.rank - b.rank);
}

function runIrisReading() {
  if (!canRunIrisAnalysis()) {
    renderAlignmentStatus();
    return;
  }
  const manualRightObservations = buildManualObservationReading("right");
  const manualLeftObservations = buildManualObservationReading("left");
  const hasManualObservations = manualRightObservations.length || manualLeftObservations.length;
  const rightResults = manualRightObservations;
  const leftResults = manualLeftObservations;
  state.readingResults = {
    right: rightResults,
    left: leftResults
  };
  const payload = {
    createdAt: new Date().toISOString(),
    accountPhone: localStorage.getItem(AUTH_SESSION_KEY) || "",
    right: rightResults,
    left: leftResults,
    allObservations: {
      right: manualRightObservations,
      left: manualLeftObservations
    },
    manualObservations: {
      right: manualRightObservations,
      left: manualLeftObservations
    },
    observationMode: hasManualObservations ? "manual" : "manual-empty",
    collarette: state.collaretteObservations,
    summary: buildReadingSummary([...rightResults, ...leftResults])
  };

  localStorage.setItem("irisReadingResult", JSON.stringify(payload));
  if (typeof window.renderIrisPersonalDashboard === "function") {
    window.renderIrisPersonalDashboard();
  }
  const readingOwner = localStorage.getItem(AUTH_SESSION_KEY) || "";
  if (readingOwner) {
    const historyKey = `irisReadingHistory:${readingOwner}`;
    let history = [];
    try { history = JSON.parse(localStorage.getItem(historyKey) || "[]"); } catch (_) { history = []; }
    history.push(payload);
    localStorage.setItem(historyKey, JSON.stringify(history.slice(-12)));
  }
  const readingUrl = new URL("reading.html", window.location.href).href;
  window.open(readingUrl, "_blank") || (window.location.href = readingUrl);
  return;
  selectionDetails.innerHTML = `
    <div>
      <h3>홍채 판독</h3>

      <strong>우안</strong>
      ${renderReadingList(rightResults)}

      <strong>좌안</strong>
      ${renderReadingList(leftResults)}
    </div>
  `;
}

function buildReadingSummary(results) {
  const grouped = {};

  results.forEach((item) => {
    const info = typeof irisOrganDB !== "undefined" ? irisOrganDB[item.code] : null;
    const title = item.area || info?.title || item.code;
    if (!grouped[title]) {
      grouped[title] = {
        title,
        image: info?.image || "",
        functions: info?.functions || [],
        reactions: info?.reactions || [],
        signs: [],
        scores: []
      };
    }

    grouped[title].signs.push(`${item.code} ${item.type} ${item.score}`);
    grouped[title].scores.push(item.score);
  });

  return Object.values(grouped)
    .map((group) => ({
      ...group,
      avg: Math.round(group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length)
    }))
    .sort((a, b) => b.avg - a.avg);
}

function renderReadingList(results) {
  if (!results.length) {
    return `<p>판독 결과가 없습니다.</p>`;
  }

  return `
    <ul>
      ${results.map(item => `
        <li>${item.code} ${item.type} ${item.score}</li>
      `).join("")}
    </ul>
  `;
}

function updateObservationTypeButtons() {
  observationTypeButtons?.querySelectorAll("[data-observation-type]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.observationType === state.manualObservationType);
  });
}

function updateObservationStrengthButtons() {
  observationStrengthButtons?.querySelectorAll("[data-observation-strength]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.observationStrength === state.manualObservationStrength);
  });
}

function findSelectedManualObservation() {
  return currentEye().markers.find((marker) => marker.id === state.selectedObservationId) || null;
}

function renderManualObservations() {
  if (!manualObservationList) return;
  const eye = currentEye();
  const markers = eye.markers || [];
  if (deleteObservationButton) deleteObservationButton.disabled = !state.selectedObservationId;
  if (clearObservationsButton) clearObservationsButton.disabled = markers.length === 0;
  if (!markers.length) {
    manualObservationList.className = "manual-observation-list empty";
    manualObservationList.textContent = "아직 기록된 관찰이 없습니다.";
    renderManualObservationGuide(null);
    return;
  }

  const grouped = groupManualObservations(markers);
  manualObservationList.className = "manual-observation-list";
  manualObservationList.innerHTML = grouped.map((group) => `
    <details class="manual-observation-group" open>
      <summary>${group.label} <span>${group.items.length}개</span></summary>
      <div class="manual-observation-group-list">
        ${group.items.map(({ marker, index }) => `
          <div class="manual-observation-row ${marker.id === state.selectedObservationId ? "is-selected" : ""}" data-observation-row="${marker.id}">
            <button class="manual-observation-select" type="button" data-observation-id="${marker.id}">
              <span class="manual-row-main">${marker.code} ${marker.organ} · ${marker.type || manualObservationLabels[marker.pattern] || "관찰"}</span>
              <span class="manual-row-meta">${marker.clockTime || `${marker.hour || group.hour}시`} · 반경 ${marker.radiusPercent ?? Math.round((marker.radiusRatio || 0) * 100)}% · ${marker.strength || "중"}</span>
            </button>
            <button class="manual-observation-delete" type="button" data-delete-observation-id="${marker.id}" aria-label="${marker.code} 관찰 삭제">삭제</button>
          </div>
        `).join("")}
      </div>
    </details>
  `).join("");
}

function groupManualObservations(markers) {
  const items = markers
    .map((marker, index) => ({ marker, index }))
    .sort((a, b) => {
      const ar = Number(a.marker.ring || String(a.marker.code || a.marker.area || "").split("-")[1]) || 0;
      const br = Number(b.marker.ring || String(b.marker.code || b.marker.area || "").split("-")[1]) || 0;
      return manualMarkerSortValue(a.marker) - manualMarkerSortValue(b.marker) ||
        manualMarkerMinute(a.marker) - manualMarkerMinute(b.marker) ||
        ar - br ||
        a.index - b.index;
    });
  return [{
    key: "clock-order",
    hour: 0,
    label: "시간순 관찰 기록",
    items
  }];
}

function manualMarkerSortValue(marker) {
  return manualClockOrder(manualMarkerHour(marker));
}

function manualMarkerHour(marker) {
  const hour = Number(marker?.hour);
  if (hour) return hour;
  const text = `${marker?.clockTime || ""} ${marker?.code || ""} ${marker?.area || ""}`;
  const clockMatch = text.match(/(\d{1,2})\s*시/);
  if (clockMatch) return Number(clockMatch[1]) || 0;
  const codeMatch = text.match(/\b(\d{1,2})\s*-/);
  return codeMatch ? Number(codeMatch[1]) || 0 : 0;
}

function manualClockOrder(hour) {
  const normalized = Number(hour) || 0;
  if (normalized === 12) return 0;
  if (normalized >= 1 && normalized <= 11) return normalized;
  return 99;
}

function manualMarkerMinute(marker) {
  const match = String(marker?.clockTime || "").match(/(\d+)\s*시\s*(\d+)\s*분/);
  return match ? Number(match[2]) : 0;
}

manualObservationList?.addEventListener("click", (event) => {
  const deleteItem = event.target.closest("[data-delete-observation-id]");
  if (deleteItem) {
    const markerId = deleteItem.dataset.deleteObservationId;
    const eye = currentEye();
    eye.markers = (eye.markers || []).filter((entry) => entry.id !== markerId);
    if (state.selectedObservationId === markerId) {
      state.selectedObservationId = null;
      eye.selected = null;
      renderManualObservationGuide(null);
      renderSelection(null);
      renderDetailMap(null);
    }
    renderManualObservations();
    renderMarkers();
    draw();
    scheduleEyeStatePersistence(state.activeEye);
    return;
  }
  const item = event.target.closest("[data-observation-id]");
  if (!item) return;
  const marker = currentEye().markers.find((entry) => entry.id === item.dataset.observationId);
  if (!marker) return;
  state.selectedObservationId = marker.id;
  state.manualObservationStrength = marker.strength || "중";
  updateObservationStrengthButtons();
  currentEye().selected = { x: marker.x, y: marker.y };
  renderManualObservations();
  renderManualObservationGuide(marker);
  renderSelection(marker);
  renderDetailMap(marker);
  draw();
});

function renderManualObservationGuide(marker) {
  if (!manualObservationGuide) return;
  if (!marker) {
    manualObservationGuide.hidden = true;
    manualObservationGuide.innerHTML = "";
    return;
  }

  const organGuide = buildOrganGuide(marker);
  manualObservationGuide.hidden = false;
  manualObservationGuide.innerHTML = `
    <article class="observation-guide-card">
      <h3>${marker.type || manualObservationLabels[marker.pattern] || "관찰"} 의미</h3>
      <p>${manualPatternDescriptions[marker.pattern] || "관찰자가 직접 표시한 참고 패턴입니다."}</p>
    </article>
    <article class="observation-guide-card">
      <h3>${marker.organ} 부위 참고</h3>
      <p>${organGuide.summary}</p>
      <ul>
        ${organGuide.points.map((point) => `<li>${point}</li>`).join("")}
      </ul>
    </article>
  `;
}

function buildOrganGuide(marker) {
  const db = typeof irisOrganDB !== "undefined" ? irisOrganDB[marker.code] : null;
  const title = cleanKoreanText(db?.title) || marker.organ;
  const reactions = Array.isArray(db?.reactions) ? db.reactions.map(cleanKoreanText).filter(Boolean).slice(0, 3) : [];
  const functions = Array.isArray(db?.functions) ? db.functions.map(cleanKoreanText).filter(Boolean).slice(0, 2) : [];
  const fallback = getSimpleOrganGuide(title || marker.organ);
  const basePoints = reactions.length
    ? reactions
    : functions.length
      ? functions
      : fallback.points;
  return {
    summary: `${title || marker.organ} 영역은 ${fallback.summary}`,
    points: basePoints.map((item) => buildObservationMeaningSentence(item, marker))
  };
}

function buildObservationMeaningSentence(value, marker) {
  const symptom = normalizeObservationSymptom(value) || marker.organ || "해당 부위";
  const particle = hasFinalConsonant(symptom) ? "은" : "는";
  return `${symptom}${particle} ${observationTracePhrase(marker.pattern)}`;
}

function normalizeObservationSymptom(value) {
  return String(value || "")
    .replace(/\s*같은\s*경향/g, "")
    .replace(/\s*경향/g, "")
    .replace(/\s*관련\s*증상/g, "")
    .replace(/\s*여부/g, "")
    .replace(/\s*확인합니다\.?/g, "")
    .replace(/\s*봅니다\.?/g, "")
    .replace(/[.。]+$/g, "")
    .trim();
}

function hasFinalConsonant(text) {
  const char = String(text || "").trim().slice(-1);
  const code = char.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

function observationIntensityLabel(strength) {
  return ({
    "약": "약간",
    "중": "다소",
    "강": "심하게",
    "매우강": "매우 심하게"
  })[strength] || "다소";
}

function observationTracePhrase(pattern) {
  return ({
    DOT: "예전에 생긴 흔적으로 참고합니다.",
    LINE: "오랫동안 반복된 흔적으로 참고합니다.",
    LACUNA: "관심을 가지고 관리해 보세요.",
    FIBER_SPREAD: "생활습관으로 관리해 보세요.",
    PIGMENT: "오래전부터 있었던 표시로 참고합니다.",
    RING: "피로나 긴장과 함께 참고해 보세요.",
    FIBER_BREAK: "현재 상태를 한 번 더 확인해 보세요.",
    IRREGULAR: "생활습관으로 관리해 보세요."
  })[pattern] || "생활습관으로 관리해 보세요.";
}

function cleanKoreanText(value) {
  const text = String(value || "").trim();
  if (!text || /[?�]/.test(text)) return "";
  return text;
}

function getSimpleOrganGuide(organ) {
  const guides = [
    { keys: ["시신경", "시각", "눈", "망막", "안압"], summary: "눈 피로, 시야 부담, 건조감, 두통처럼 눈과 머리 피로를 함께 살펴보는 부위입니다.", points: ["눈 피로", "두통·시야 흐림"] },
    { keys: ["유문", "위", "위산", "위 점막"], summary: "위에서 장으로 음식이 넘어가는 소화 흐름과 관련해 참고하는 부위입니다.", points: ["속 더부룩함·체함·역류감", "식사 후 불편감"] },
    { keys: ["갑상선"], summary: "목 앞쪽 호르몬·대사 조절과 관련해 참고하는 부위입니다.", points: ["피로·체중 변화", "목 앞쪽 불편감·두근거림"] },
    { keys: ["편도", "비강", "기관지", "폐", "흉막", "호흡"], summary: "호흡기와 상부 호흡기 컨디션을 참고하는 부위입니다.", points: ["기침·가래·비염", "숨참·얕은 호흡"] },
    { keys: ["간", "담낭"], summary: "피로, 담즙 흐름, 지방 소화, 대사 부담과 함께 보는 부위입니다.", points: ["피로·회복 지연", "기름진 음식 후 더부룩함"] },
    { keys: ["소장", "회장", "결장", "직장", "장"], summary: "소화 흡수와 배변 리듬을 참고하는 부위입니다.", points: ["변비·설사", "가스·복부 팽만"] },
    { keys: ["심장", "관상동맥", "혈액", "순환"], summary: "순환, 두근거림, 손발 차가움, 피로와 함께 참고하는 부위입니다.", points: ["가슴 답답함·두근거림", "혈압·부종·손발 냉감"] },
    { keys: ["신장", "요관", "방광", "비뇨"], summary: "소변 리듬, 부종, 수분 대사와 함께 참고하는 부위입니다.", points: ["소변 횟수·야간뇨", "옆구리 불편감·부종"] },
    { keys: ["전두엽", "변연계", "뇌", "자율신경", "시상하부", "소뇌", "뇌간"], summary: "수면, 집중, 스트레스 반응, 감정 회복력과 함께 참고하는 부위입니다.", points: ["불면·두통·집중력 저하", "스트레스 후 회복 지연"] }
  ];
  const found = guides.find((guide) => guide.keys.some((key) => organ.includes(key)));
  return found || {
    summary: "해당 위치의 생활 증상과 문진 응답을 함께 대조해 보는 참고 부위입니다.",
    points: ["현재 불편감", "과거 부담 흔적"]
  };
}

function toCircledNumber(value) {
  const circled = ["", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩", "⑪", "⑫", "⑬", "⑭", "⑮", "⑯", "⑰", "⑱", "⑲", "⑳"];
  return circled[value] || String(value);
}
function readEyeSigns(eyeKey, includeAll = false) {
  const eye = state.eyes[eyeKey];
  if (!eye.image) {
    delete state.collaretteObservations[eyeKey];
    return [];
  }

  const previousEye = state.activeEye;
  state.activeEye = eyeKey;

  drawImageOnly(eye);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  state.collaretteObservations[eyeKey] = detectCollaretteObservation(imageData, eye);

  const results = [];

  for (let hour = 1; hour <= 12; hour++) {
    for (let ring = 1; ring <= 6; ring++) {
      const code = `${hour}-${ring}`;
      const observation = scanCellForReading(imageData, eye, hour, ring);
      if (!observation.patterns.length) continue;

      const db = typeof irisObservationDB !== "undefined" ? irisObservationDB[eyeKey]?.[code] : null;
      const strongestPattern = [...observation.patterns]
        .sort((a, b) => (b.weight - a.weight) || (b.confidence - a.confidence))[0];

      results.push({
        code,
        eye: eyeKey === "right" ? "우안" : "좌안",
        area: db?.["대표부위"] || irisOrganDB?.[code]?.title || code,
        dbConsultation: db?.["상담표현"] || "해당 영역이 체크됩니다.",
        patterns: observation.patterns,
        type: strongestPattern.type,
        score: strongestPattern.confidence,
        priorityScore: observation.patterns.reduce((sum, pattern) => sum + pattern.weight, 0),
        radialPercent: observation.radialPercent,
        radialNote: getRadialObservationNote(observation.radialPercent)
      });
    }
  }

  state.activeEye = previousEye;

  const rankedResults = results
    .sort((a, b) => (b.priorityScore - a.priorityScore) || (b.score - a.score))
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      consultation: buildObservationConsultation(item, index)
    }));
  return includeAll ? rankedResults : rankedResults.slice(0, 3);
}
function scanCellForReading(imageData, eye, hour, ring) {
  const centerDeg = (hour % 12) * 30 - 90 + Number(eye.rotation || 0);
  const importantHour = isImportantReadingHour(hour);
  const spreadDeg = 15;
  const startDeg = centerDeg - spreadDeg;
  const endDeg = centerDeg + spreadDeg;

  const ringBounds = [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1];
  const irisBand = eye.irisRadius - eye.pupilRadius;
  const innerR = eye.pupilRadius + irisBand * ringBounds[ring - 1] + 2;
  const outerR = eye.pupilRadius + irisBand * ringBounds[ring] - 2;
  const sample = collectReadingSamples(imageData, eye, startDeg, endDeg, innerR, outerR, importantHour);

  if (sample.points.length < 18) return { patterns: [], radialPercent: 0 };

  const patterns = [];
  const radialFeature = detectRadialFeatureScores(sample, importantHour);
  const ringScore = detectDeepLineScore(sample, false);
  const spotFeature = detectSpotPattern(sample);
  const pigmentScore = detectColorScore(sample);
  const lacunaScore = detectLacunaScore(sample);
  const fiberSpreadScore = detectFiberSpreadScore(sample);

  if (radialFeature.groove >= 62) patterns.push(makeObservedPattern("GROOVE", radialFeature.groove));
  else if (radialFeature.line >= (importantHour ? 42 : 48)) patterns.push(makeObservedPattern("LINE", radialFeature.line));
  if (spotFeature && spotFeature.confidence >= 48) patterns.push(makeObservedPattern(spotFeature.type, spotFeature.confidence));
  if (pigmentScore >= 54) patterns.push(makeObservedPattern("PIGMENT", pigmentScore));
  if (lacunaScore >= 58) patterns.push(makeObservedPattern("LACUNA", lacunaScore));
  if (ringScore >= 62) patterns.push(makeObservedPattern("RING", ringScore));
  if (fiberSpreadScore >= 58) patterns.push(makeObservedPattern("FIBER_SPREAD", fiberSpreadScore));

  return {
    patterns,
    radialPercent: Math.round((((innerR + outerR) / 2) - eye.pupilRadius) / irisBand * 100)
  };
}

const observationPatternWeights = {
  GROOVE: 5,
  LACUNA: 5,
  BLACK_DOT: 5,
  PIGMENT: 4,
  BROWN_DOT: 4,
  LINE: 3,
  DOT: 2,
  FIBER_SPREAD: 2,
  RING: 1
};

const observationPatternMemberText = {
  LINE: "이 부위가 먼저 보입니다.",
  GROOVE: "이 부위가 먼저 보입니다.",
  DOT: "이 부위도 체크됩니다.",
  PIGMENT: "이 부위가 눈에 띕니다.",
  BLACK_DOT: "이 부위가 눈에 띕니다.",
  BROWN_DOT: "이 부위가 눈에 띕니다.",
  LACUNA: "오래된 부담으로 참고됩니다.",
  RING: "전체 컨디션 참고 신호로 봅니다.",
  FIBER_SPREAD: "이 부위가 느슨하게 보입니다."
};

function makeObservedPattern(type, confidence) {
  return {
    type,
    confidence: clamp(Math.round(confidence), 0, 95),
    weight: observationPatternWeights[type] || 0,
    memberText: observationPatternMemberText[type] || "참고 신호로 봅니다."
  };
}

function getRadialObservationNote(radialPercent) {
  if (radialPercent < 33) return "동공에 가까운 안쪽 관찰 위치입니다. 발생 시점은 문진과 실제 병력 기록을 우선하여 확인합니다.";
  if (radialPercent < 66) return "홍채 중간 반경의 관찰 위치입니다. 위치만으로 증상의 시작 시기나 원인을 단정하지 않습니다.";
  return "홍채 바깥 반경의 관찰 위치입니다. 생활습관·환경·과거 이력과 함께 비교하여 참고합니다.";
}

function buildObservationConsultation(item, rankIndex) {
  let dbText = item.dbConsultation || `${item.area} 관련 영역이 체크됩니다.`;
  if (rankIndex === 1) dbText = dbText.replace(/가장 먼저|먼저/g, "함께");
  if (rankIndex >= 2) dbText = dbText.replace(/가장 먼저|먼저|함께/g, "참고로");
  const patternText = item.patterns
    .slice(0, 2)
    .map((pattern) => pattern.memberText)
    .filter((text, index, list) => list.indexOf(text) === index)
    .join(" ");
  return `${dbText} ${patternText} ${item.radialNote}`;
}

function detectRadialFeatureScores(sample, importantHour) {
  const bandWidth = Math.max(1, sample.outerR - sample.innerR);
  const runs = sample.columns
    .map((column) => findBestDarkRun(column, sample.radialStep, importantHour))
    .filter((run) => run && run.length / bandWidth >= 0.24);

  if (!runs.length) return { line: 0, groove: 0 };

  const groups = [];
  runs.sort((a, b) => a.deg - b.deg).forEach((run) => {
    const last = groups[groups.length - 1];
    if (last && Math.abs(run.deg - last.lastDeg) <= sample.angleStep * 1.7 && Math.abs(run.midR - last.avgMidR) <= 12) {
      last.runs.push(run);
      last.lastDeg = run.deg;
      last.avgMidR = last.runs.reduce((sum, item) => sum + item.midR, 0) / last.runs.length;
    } else {
      groups.push({ runs: [run], lastDeg: run.deg, avgMidR: run.midR });
    }
  });

  const best = groups
    .map((group) => {
      const avgDepth = group.runs.reduce((sum, run) => sum + run.depth, 0) / group.runs.length;
      const avgLengthRatio = group.runs.reduce((sum, run) => sum + run.length / bandWidth, 0) / group.runs.length;
      const widthDegrees = group.runs.length * sample.angleStep;
      const narrowFiberPenalty = widthDegrees < 2 ? 0.38 : widthDegrees < 3 ? 0.72 : 1;
      const line = (avgDepth * 1.35 + avgLengthRatio * 52 + Math.min(widthDegrees, 7) * 3.8) * narrowFiberPenalty;
      const groove = avgDepth >= 15 && avgLengthRatio >= 0.42 && widthDegrees >= 2.5
        ? line + avgDepth * 0.45 + avgLengthRatio * 12
        : 0;
      return { line, groove };
    })
    .sort((a, b) => Math.max(b.line, b.groove) - Math.max(a.line, a.groove))[0];

  const importantBoost = importantHour && best.line >= 38 ? 8 : 0;
  return {
    line: clamp(Math.round(best.line + importantBoost), 0, 89),
    groove: clamp(Math.round(best.groove + importantBoost), 0, 92)
  };
}

function detectSpotPattern(sample) {
  const confidence = detectSpotScore(sample);
  if (!confidence) return null;

  const stats = makeReadingStats(sample.points.map((item) => item.lum));
  const darkLimit = Math.min(stats.p10 + 2, stats.avg - 34);
  const darkPoints = sample.points.filter((item) => item.lum < darkLimit);
  if (!darkPoints.length) return null;

  const avgLum = darkPoints.reduce((sum, item) => sum + item.lum, 0) / darkPoints.length;
  const avgRedBlue = darkPoints.reduce((sum, item) => sum + item.red - item.blue, 0) / darkPoints.length;
  const type = avgLum < 48 ? "BLACK_DOT" : avgRedBlue > 22 ? "BROWN_DOT" : "DOT";
  return { type, confidence };
}

function detectLacunaScore(sample) {
  const lums = sample.points.map((item) => item.lum);
  const stats = makeReadingStats(lums);
  const muted = sample.points.filter((item) => item.lum < stats.avg - 18 && item.sat < 0.48);
  const ratio = muted.length / sample.points.length;
  if (ratio < 0.1 || ratio > 0.38) return 0;

  const radialSpread = Math.max(...muted.map((item) => item.r)) - Math.min(...muted.map((item) => item.r));
  const angleSpread = Math.max(...muted.map((item) => item.deg)) - Math.min(...muted.map((item) => item.deg));
  if (radialSpread < 7 || angleSpread < 4 || angleSpread > 18) return 0;

  const depth = muted.reduce((sum, item) => sum + stats.avg - item.lum, 0) / muted.length;
  return clamp(Math.round(ratio * 85 + depth * 1.05 + Math.min(radialSpread, 20)), 0, 88);
}

function detectFiberSpreadScore(sample) {
  const gradients = [];
  sample.columns.forEach((column) => {
    for (let index = 1; index < column.length; index += 1) {
      gradients.push(Math.abs(column[index].lum - column[index - 1].lum));
    }
  });
  if (gradients.length < 20) return 0;

  const gradientStats = makeReadingStats(gradients);
  const lumStats = makeReadingStats(sample.points.map((item) => item.lum));
  const lowDefinition = clamp((12 - gradientStats.p50) / 12, 0, 1);
  const lowContrast = clamp((42 - (lumStats.p90 - lumStats.p10)) / 42, 0, 1);
  if (lowDefinition < 0.35 || lowContrast < 0.25) return 0;
  return clamp(Math.round(38 + lowDefinition * 30 + lowContrast * 22), 0, 82);
}

function detectCollaretteObservation(imageData, eye) {
  const irisBand = eye.irisRadius - eye.pupilRadius;
  if (irisBand <= 0) return null;

  const candidates = [];
  for (let ratio = 0.18; ratio <= 0.54; ratio += 0.02) {
    const radius = eye.pupilRadius + irisBand * ratio;
    const gradients = [];

    for (let degree = 0; degree < 360; degree += 6) {
      const angle = degree * Math.PI / 180;
      const inside = pixelAt(imageData, eye.centerX + Math.cos(angle) * (radius - 2), eye.centerY + Math.sin(angle) * (radius - 2));
      const outside = pixelAt(imageData, eye.centerX + Math.cos(angle) * (radius + 2), eye.centerY + Math.sin(angle) * (radius + 2));
      const insideLum = inside.r * 0.2126 + inside.g * 0.7152 + inside.b * 0.0722;
      const outsideLum = outside.r * 0.2126 + outside.g * 0.7152 + outside.b * 0.0722;
      const insideSat = Math.max(inside.r, inside.g, inside.b) === 0 ? 0 : (Math.max(inside.r, inside.g, inside.b) - Math.min(inside.r, inside.g, inside.b)) / Math.max(inside.r, inside.g, inside.b);
      const outsideSat = Math.max(outside.r, outside.g, outside.b) === 0 ? 0 : (Math.max(outside.r, outside.g, outside.b) - Math.min(outside.r, outside.g, outside.b)) / Math.max(outside.r, outside.g, outside.b);
      if (isExcludedReadingPixel(inside, insideLum, insideSat) || isExcludedReadingPixel(outside, outsideLum, outsideSat)) continue;
      gradients.push(Math.abs(outsideLum - insideLum));
    }

    if (gradients.length >= 20) candidates.push({ ratio, strength: medianNumber(gradients) });
  }

  const best = candidates.sort((a, b) => b.strength - a.strength)[0];
  if (!best || best.strength < 6) return null;

  const size = best.ratio < 0.29 ? "작음" : best.ratio > 0.44 ? "넓음" : "보통";
  const consultation = size === "작음"
    ? "동공 바깥 꽃모양 영역이 작게 보여 기본 체력과 소화력이 약한 쪽으로 참고합니다."
    : size === "넓음"
      ? "동공 바깥 꽃모양 영역이 넓게 보여 기본 체력과 소화력이 안정적인 쪽으로 참고합니다."
      : "동공 바깥 꽃모양 영역은 보통 범위로 관찰됩니다.";

  return { type: "COLLARETTE", size, radialPercent: Math.round(best.ratio * 100), confidence: clamp(Math.round(best.strength * 4), 0, 90), consultation };
}

function isImportantReadingHour(hour) {
  return hour === 11 || hour === 12 || hour === 1;
}

function collectReadingSamples(imageData, eye, startDeg, endDeg, innerR, outerR, importantHour) {
  const angleStep = importantHour ? 1 : 1.5;
  const radialStep = 1.4;
  const columns = [];
  const points = [];

  for (let deg = startDeg; deg <= endDeg; deg += angleStep) {
    const angle = (deg * Math.PI) / 180;
    const column = [];

    for (let r = innerR; r <= outerR; r += radialStep) {
      const x = eye.centerX + Math.cos(angle) * r;
      const y = eye.centerY + Math.sin(angle) * r;
      const p = pixelAt(imageData, x, y);
      const lum = p.r * 0.2126 + p.g * 0.7152 + p.b * 0.0722;
      const max = Math.max(p.r, p.g, p.b);
      const min = Math.min(p.r, p.g, p.b);
      const sat = max === 0 ? 0 : (max - min) / max;

      if (isExcludedReadingPixel(p, lum, sat)) continue;

      const item = { deg, r, lum, sat, red: p.r, green: p.g, blue: p.b };
      column.push(item);
      points.push(item);
    }

    if (column.length >= 4) columns.push(column);
  }

  return { columns, points, radialStep, angleStep, innerR, outerR };
}

function isExcludedReadingPixel(pixel, lum, sat) {
  const brightGlare = lum > 225 && pixel.r > 215 && pixel.g > 215 && pixel.b > 205;
  const whiteGlare = lum > 205 && sat < 0.12 && pixel.r > 185 && pixel.g > 185 && pixel.b > 185;
  const skinLike = lum > 155 && pixel.r - pixel.b > 58 && pixel.r - pixel.g > 24 && sat < 0.42;
  return brightGlare || whiteGlare || skinLike;
}

function detectDeepLineScore(sample, importantHour) {
  const columnRuns = sample.columns
    .map((column) => findBestDarkRun(column, sample.radialStep, importantHour))
    .filter(Boolean);

  if (!columnRuns.length) return 0;

  const groups = [];
  columnRuns.forEach((run) => {
    let group = groups.find((item) => Math.abs(item.midR - run.midR) <= 8);
    if (!group) {
      group = { midR: run.midR, runs: [], maxDepth: 0, maxLength: 0 };
      groups.push(group);
    }

    group.runs.push(run);
    group.midR = (group.midR * (group.runs.length - 1) + run.midR) / group.runs.length;
    group.maxDepth = Math.max(group.maxDepth, run.depth);
    group.maxLength = Math.max(group.maxLength, run.length);
  });

  const best = groups
    .map((group) => {
      const continuity = longestConsecutiveRun(group.runs.map((run) => run.deg), sample.angleStep);
      const avgDepth = group.runs.reduce((sum, run) => sum + run.depth, 0) / group.runs.length;
      const avgLength = group.runs.reduce((sum, run) => sum + run.length, 0) / group.runs.length;
      const widthPenalty = continuity < 2 ? 0.35 : continuity < 3 ? 0.75 : 1;
      const score = (
        avgDepth * 1.05 +
        group.maxDepth * 0.95 +
        avgLength * 0.42 +
        group.maxLength * 0.32 +
        continuity * 8.2
      ) * widthPenalty;

      return { score, continuity, avgDepth, avgLength };
    })
    .sort((a, b) => b.score - a.score)[0];

  if (!best) return 0;

  let score = best.score;
  if (best.avgLength < 5.5 || best.avgDepth < 9) score *= 0.55;
  if (importantHour && score >= 35) score += 12;

  return clamp(Math.round(score), 0, 89);
}

function findBestDarkRun(column, radialStep, importantHour) {
  const values = column.map((item) => item.lum);
  const stats = makeReadingStats(values);
  const darkLimit = Math.min(stats.p25 - 2, stats.avg - (importantHour ? 9 : 13));
  const minLength = importantHour ? 4.2 : 5.6;
  const runs = [];
  let current = [];

  column.forEach((item) => {
    if (item.lum < darkLimit) {
      current.push(item);
    } else if (current.length) {
      runs.push(current);
      current = [];
    }
  });

  if (current.length) runs.push(current);

  return runs
    .map((run) => {
      const length = run.length * radialStep;
      const depth = run.reduce((sum, item) => sum + Math.max(0, stats.p75 - item.lum), 0) / run.length;
      const midR = run.reduce((sum, item) => sum + item.r, 0) / run.length;
      return { deg: run[0].deg, midR, length, depth };
    })
    .filter((run) => run.length >= minLength && run.depth >= (importantHour ? 5.5 : 7))
    .sort((a, b) => (b.depth * b.length) - (a.depth * a.length))[0] || null;
}

function longestConsecutiveRun(degrees, angleStep) {
  if (!degrees.length) return 0;
  const sorted = [...degrees].sort((a, b) => a - b);
  let best = 1;
  let current = 1;

  for (let index = 1; index < sorted.length; index++) {
    if (Math.abs(sorted[index] - sorted[index - 1]) <= angleStep * 1.6) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}

function detectSpotScore(sample) {
  const lums = sample.points.map((item) => item.lum);
  const stats = makeReadingStats(lums);
  const darkLimit = Math.min(stats.p10 + 2, stats.avg - 34);
  const darkPoints = sample.points.filter((item) => item.lum < darkLimit);
  const darkRatio = darkPoints.length / sample.points.length;

  if (darkPoints.length < 7 || darkRatio > 0.16) return 0;

  const radialSpread = Math.max(...darkPoints.map((item) => item.r)) - Math.min(...darkPoints.map((item) => item.r));
  const angleSpread = Math.max(...darkPoints.map((item) => item.deg)) - Math.min(...darkPoints.map((item) => item.deg));
  const depth = darkPoints.reduce((sum, item) => sum + Math.max(0, stats.avg - item.lum), 0) / darkPoints.length;
  const compactness = radialSpread <= 14 && angleSpread <= 6 ? 1 : radialSpread <= 22 && angleSpread <= 10 ? 0.62 : 0.24;
  const lineLikePenalty = radialSpread > 24 || angleSpread > 12 ? 0.35 : 1;
  const score = (
    Math.sqrt(darkPoints.length) * 3.1 +
    depth * 0.58 +
    darkRatio * 36
  ) * compactness * lineLikePenalty;

  return clamp(Math.round(score), 0, 86);
}

function detectColorScore(sample) {
  const satValues = sample.points.map((item) => item.sat);
  const lumValues = sample.points.map((item) => item.lum);
  const redValues = sample.points.map((item) => item.red);
  const blueValues = sample.points.map((item) => item.blue);
  const satStats = makeReadingStats(satValues);
  const lumStats = makeReadingStats(lumValues);
  const redBlueStats = makeReadingStats(sample.points.map((item, index) => redValues[index] - blueValues[index]));
  const colorChanged = sample.points.filter((item) => {
    const brownDeposit = item.red - item.blue > redBlueStats.p75 + 9 && item.sat > satStats.avg + 0.05;
    const grayDull = item.sat < satStats.avg - 0.08 && item.lum < lumStats.avg - 10;
    const cloudy = item.lum > lumStats.avg + 22 && item.sat < satStats.avg - 0.06;
    return brownDeposit || grayDull || cloudy;
  });
  const changedRatio = colorChanged.length / sample.points.length;

  if (changedRatio < 0.08) return 0;

  const score = changedRatio * 62 + (satStats.p90 - satStats.p10) * 34 + (lumStats.p90 - lumStats.p10) * 0.12;
  return clamp(Math.round(score), 0, 84);
}

function makeReadingStats(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    p25: sorted[Math.floor((sorted.length - 1) * 0.25)],
    p50: sorted[Math.floor((sorted.length - 1) * 0.5)],
    p75: sorted[Math.floor((sorted.length - 1) * 0.75)],
    p10: sorted[Math.floor((sorted.length - 1) * 0.1)],
    p90: sorted[Math.floor((sorted.length - 1) * 0.9)]
  };
}
function renderIrisMapping(results) {
  if (!results.length) {
    detailMap.innerHTML = `<p>홍채 관찰 기록이 없습니다.</p>`;
    return;
  }

  detailMap.innerHTML = results.map(item => {
    const info = irisOrganDB[item.code];
    if (!info) return "";

    return `
      <div class="marker-item">
        <strong>${item.code} ${info.title}</strong>
        <span>${item.type} ${item.score}</span>

        <img src="${info.image}" style="width:130px; margin-top:10px; border-radius:10px;">

        <div style="margin-top:10px;">
          <b>관련 기능</b>
          <ul>
            ${info.functions.map(v => `<li>${v}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;
  }).join("");
}

mappingButton.addEventListener("click", () => {
  window.location.href = "subscription.html";
});
universeButton?.addEventListener("click", () => {
  window.location.href = "universe.html";
});
function renderAiSummary(results) {
  if (!results.length) {
    markerList.className = "marker-list empty";
    markerList.innerHTML = "홍채 관찰 기록이 없습니다.";
    return;
  }

  const grouped = {};

  results.forEach((item) => {
    const info = irisOrganDB[item.code];
    if (!info) return;

    const key = info.title;

    if (!grouped[key]) {
      grouped[key] = {
        title: info.title,
        scores: [],
        signs: [],
        reactions: info.reactions || []
      };
    }

    grouped[key].scores.push(item.score);
    grouped[key].signs.push(`${item.code} ${item.type} ${item.score}`);
  });

  const summaries = Object.values(grouped)
    .map((group) => ({
      ...group,
      avg: Math.round(group.scores.reduce((a, b) => a + b, 0) / group.scores.length)
    }))
    .sort((a, b) => b.avg - a.avg);

  markerList.className = "marker-list";
  markerList.innerHTML = summaries.map((group, index) => `
    <div class="marker-item">
      <strong>${index + 1}. ${group.title} ${group.avg}</strong>
      <span>${group.signs.join(" / ")}</span>

      <div style="margin-top:8px;">
        <b>관련 징후</b>
        <ul>
          ${group.reactions.map(v => `<li>${v}</li>`).join("")}
        </ul>
      </div>
    </div>
  `).join("");
}
