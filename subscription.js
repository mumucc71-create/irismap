const subscriptionAnalysis = window.IrisCareEngine?.analyze?.() || {
  phone: "",
  type: "기본 관리형",
  primary: [],
  scores: {}
};

const subscriptionKey = subscriptionAnalysis.phone ? `irisSubscription:${subscriptionAnalysis.phone}` : "irisSubscription";
const vipKey = subscriptionAnalysis.phone ? `irisVipMembership:${subscriptionAnalysis.phone}` : "irisVipMembership";
const savedSubscription = readSubscription(subscriptionKey) || {};
let vipMembership = readSubscription(vipKey) || {};

const uniqueSubscription = (items) => [...new Set(items.filter(Boolean))];
const currentBox = uniqueSubscription((subscriptionAnalysis.primary || []).flatMap((item) => item.box || [])).slice(0, 8);

function readSubscription(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch (_) {
    return null;
  }
}

function escapeSubscription(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function ensureVipFromUniverseReport() {
  if (vipMembership.active || !subscriptionAnalysis.phone) return;
  const universeHistory = readSubscription(`UniverseReportDB:${subscriptionAnalysis.phone}`);
  if (!Array.isArray(universeHistory) || !universeHistory.length) return;

  const now = new Date().toISOString();
  vipMembership = {
    active: true,
    tier: "보험 VIP",
    activatedAt: now,
    updatedAt: now,
    source: "유니버스 PDF 리포트",
    benefits: [
      "유니버스 리포트",
      "라이프진단",
      "보장분석",
      "홍채 결과 저장",
      "문진 결과 저장",
      "건강박스 1회 무료 제공"
    ],
    healthBox: {
      benefit: "1회 무료 제공",
      status: "미사용",
      composition: "운영자 직접 구성",
      items: [],
      updatedAt: now
    }
  };
  localStorage.setItem(vipKey, JSON.stringify(vipMembership));
}

function savePlan(button) {
  const startDate = savedSubscription.startDate || new Date().toISOString();
  const payload = {
    status: "관리 중",
    plan: button.dataset.plan,
    startDate,
    updatedAt: new Date().toISOString(),
    healthType: subscriptionAnalysis.type,
    box: currentBox,
    scoreSnapshot: subscriptionAnalysis.scores
  };

  localStorage.setItem(subscriptionKey, JSON.stringify(payload));

  if (subscriptionAnalysis.phone) {
    const boxHistoryKey = `irisHealthBoxHistory:${subscriptionAnalysis.phone}`;
    const boxHistory = readSubscription(boxHistoryKey) || [];
    boxHistory.push({
      recordedAt: new Date().toISOString(),
      plan: button.dataset.plan,
      healthType: subscriptionAnalysis.type,
      box: currentBox
    });
    localStorage.setItem(boxHistoryKey, JSON.stringify(boxHistory.slice(-12)));
  }

  document.querySelector("#saveStatus").textContent =
    `${button.dataset.plan} 플랜을 회원 기록에 저장했습니다. 실제 결제나 주문은 발생하지 않습니다.`;
}

function renderVipBenefit() {
  const statusTarget = document.querySelector("#vipStatus");
  const benefitTarget = document.querySelector("#vipBenefits");
  const boxTarget = document.querySelector("#vipBoxStatus");
  if (!statusTarget || !benefitTarget || !boxTarget) return;

  if (!vipMembership.active) {
    statusTarget.innerHTML =
      '<p class="muted">유니버스 병력분석 PDF 업로드를 완료하면 보험 VIP 회원과 건강박스 1회 무료 혜택이 활성화됩니다.</p><a class="button" href="ai-health.html#universe">유니버스 PDF 업로드</a>';
    benefitTarget.innerHTML = "";
    boxTarget.innerHTML = "";
    return;
  }

  const benefits = vipMembership.benefits || [
    "유니버스 리포트",
    "라이프진단",
    "보장분석",
    "홍채 결과 저장",
    "문진 결과 저장",
    "건강박스 1회 무료 제공"
  ];
  const healthBox = vipMembership.healthBox || {
    status: "미사용",
    composition: "회원 상태를 참고하여 운영자가 직접 구성"
  };

  statusTarget.innerHTML =
    "<p><strong>VIP 활성화 완료</strong><br>축하합니다. 회원님께 건강박스 1회 무료 제공 혜택이 지급되었습니다.</p>";
  benefitTarget.innerHTML = benefits.map((item) => `<span>${escapeSubscription(item)}</span>`).join("");
  boxTarget.innerHTML =
    `<p><strong>건강박스 상태</strong> <span class="status-pill">${escapeSubscription(healthBox.status || "미사용")}</span></p>` +
    `<p class="muted">${escapeSubscription(healthBox.composition || "회원 상태를 참고하여 운영자가 직접 구성")}</p>`;
}

ensureVipFromUniverseReport();
renderVipBenefit();

document.querySelectorAll(".plan-button").forEach((button) => {
  button.addEventListener("click", () => savePlan(button));
});
