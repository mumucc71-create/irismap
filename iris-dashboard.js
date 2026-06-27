(function () {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const unique = (items) => [...new Set(items.filter(Boolean))];

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function readJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch (_) {
      return null;
    }
  }

  function labelFor(item) {
    return item?.selected?.name || item?.name || "관찰 영역";
  }

  function matchLabels(item, key) {
    return unique((item?.selected?.[key] || []).map((match) => match.label || match.value)).slice(0, 4);
  }

  function renderEmpty() {
    $("#irisAnalysisLead").textContent = "좌우 홍채 사진을 판독하면 이곳에 회원 개인 분석 결과가 표시됩니다.";
    $("#irisAnalysisMeta").innerHTML = '<span>개인 결과 대기</span><span>문진과 함께 교차확인</span>';
    $("#irisTopAreas").innerHTML = '<p class="iris-empty-copy">아직 저장된 홍채 판독 결과가 없습니다.</p>';
    $("#irisQuestionnaireCrosscheck").innerHTML = '<p>문진을 작성하면 홍채에서 관찰된 후보 영역과 교차확인할 수 있습니다.</p><a class="iris-inline-link" href="health.html">문진 입력하기</a>';
    $("#irisIntegratedSummary").innerHTML = '<p>홍채 판독 후 문진, 생활습관, 병력 정보를 우선하여 종합 해석합니다.</p>';
    $("#irisManagementDirections").innerHTML = '<p>분석 자료가 준비되면 관리 우선순위가 표시됩니다.</p>';
    $("#irisShoppingRecommendations").innerHTML = '<p>관리 목적이 확인되면 관련 성분을 안내합니다.</p>';
  }

  function renderTopAreas(items) {
    if (!items.length) {
      $("#irisTopAreas").innerHTML = '<p class="iris-empty-copy">표시할 관리 영역이 없습니다.</p>';
      return;
    }

    $("#irisTopAreas").innerHTML = items.map((item, index) => {
      const selected = item.selected || item;
      const match = selected.questionnaireMatchPercent;
      const matchText = match === null || match === undefined ? "문진 확인 전" : `문진 일치도 ${Math.round(match)}%`;
      return `<div class="iris-top-item">
        <span class="iris-rank">${index + 1}</span>
        <strong>${escapeHtml(labelFor(item))}</strong>
        <small>${escapeHtml(matchText)}</small>
        <span class="iris-priority">관리 우선도 ${escapeHtml(selected.managementPriority || "참고")}</span>
      </div>`;
    }).join("");
  }

  function renderCrosscheck(items, hasQuestionnaire) {
    if (!hasQuestionnaire) {
      $("#irisQuestionnaireCrosscheck").innerHTML = '<p>저장된 문진이 없어 홍채 관찰 결과만으로 결론을 내리지 않습니다.</p><a class="iris-inline-link" href="health.html">문진 입력하기</a>';
      return;
    }

    const rows = items.slice(0, 3).map((item) => {
      const matches = matchLabels(item, "questionnaireMatches");
      const lifestyle = matchLabels(item, "lifestyleMatches");
      const details = unique([...matches, ...lifestyle]);
      return `<li><strong>${escapeHtml(labelFor(item))}</strong><span>${escapeHtml(details.length ? details.join(" · ") : "직접 일치 항목 없음")}</span></li>`;
    });
    $("#irisQuestionnaireCrosscheck").innerHTML = `<ul class="iris-cross-list">${rows.join("")}</ul>`;
  }

  function renderSummary(integrated, items) {
    const consultations = items.slice(0, 3).map((item) => item.consultation).filter(Boolean);
    const fallback = items.length
      ? `${items.slice(0, 3).map(labelFor).join(", ")} 영역이 현재 관리 후보로 표시됩니다.`
      : "현재 표시할 종합 해석이 없습니다.";
    const text = consultations.length ? consultations.join(" ") : fallback;
    $("#irisIntegratedSummary").innerHTML = `<p>${escapeHtml(text)}</p>`;

    const confidence = integrated?.confidence || {};
    const overall = confidence.overall === null || confidence.overall === undefined
      ? "종합 신뢰도 낮음"
      : `종합 신뢰도 ${Math.round(confidence.overall)}%`;
    $("#irisAnalysisMeta").innerHTML = `<span>${escapeHtml(overall)}</span><span>문진 · 생활습관 · 병력 · 홍채 교차확인</span>`;
  }

  function renderManagement(care, items) {
    const goals = unique((care?.primary || []).flatMap((profile) => profile.goals || [])).slice(0, 6);
    const fallback = items.slice(0, 3).map((item) => `${labelFor(item)} 관리 기록`);
    const values = goals.length ? goals : fallback;
    $("#irisManagementDirections").innerHTML = values.length
      ? `<ul class="iris-chip-list">${values.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`
      : "<p>문진과 판독 결과가 준비되면 관리 방향이 표시됩니다.</p>";
  }

  function renderShopping(care) {
    const ingredients = unique((care?.primary || []).flatMap((profile) => profile.ingredients || [])).slice(0, 6);
    $("#irisShoppingRecommendations").innerHTML = ingredients.length
      ? `<p>현재 관리 목적에 따라 먼저 비교할 성분입니다.</p><ul class="iris-chip-list">${ingredients.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`
      : "<p>문진과 판독 결과를 바탕으로 성분 추천을 준비합니다.</p>";
  }

  function render() {
    const root = $("#irisPersonalDashboard");
    if (!root) return;

    const iris = readJson("irisReadingResult");
    if (!iris) {
      renderEmpty();
      return;
    }

    const phone = localStorage.getItem("irisMappingSession") || "";
    let integrated = null;
    let care = null;
    try {
      integrated = window.IrisIntegratedReadingEngine?.analyze(phone) || null;
    } catch (_) {
      integrated = null;
    }
    try {
      care = window.IrisCareEngine?.analyze(phone) || null;
    } catch (_) {
      care = null;
    }

    const combined = [...(integrated?.results || []), ...(integrated?.additionalResults || [])];
    const seen = new Set();
    const items = combined.filter((item) => {
      const key = item?.selected?.id || labelFor(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 5);

    const primaryType = care?.type || (items[0] ? `${labelFor(items[0])} 우선 관리형` : "개인 분석 완료");
    $("#irisAnalysisLead").textContent = `${primaryType}으로 분석되었습니다. 문진과 생활습관을 우선하고 홍채 관찰은 교차확인 자료로 반영했습니다.`;
    renderTopAreas(items);
    renderCrosscheck(items, Boolean(integrated?.hasQuestionnaire));
    renderSummary(integrated, items);
    renderManagement(care, items);
    renderShopping(care);
  }

  window.renderIrisPersonalDashboard = render;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
  window.addEventListener("pageshow", render);
})();
