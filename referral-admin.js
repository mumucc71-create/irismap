(function () {
  "use strict";

  const SESSION_KEY = "irisMappingSession";
  const USERS_KEY = "irisMappingUsers";
  const GOOGLE_SCRIPT_URL_KEY = "irisConsultGoogleScriptUrl";
  const DEFAULT_GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxSNHb7KjCL6lqu08bCzqFQjeN2B17xj46nQT3LMCZuvUmqiIQZsa8uQswbrJZDzK0/exec";
  const rowsTarget = document.querySelector("#memberRows");
  const metricsTarget = document.querySelector("#metrics");
  const ownerTarget = document.querySelector("#ownerStatus");
  const refreshButton = document.querySelector("#refreshButton");

  refreshButton?.addEventListener("click", () => loadMemberDb());
  window.addEventListener("irisFirebaseReadyForApp", () => loadMemberDb());
  loadMemberDb();

  async function loadMemberDb() {
    const phone = normalizePhone(localStorage.getItem(SESSION_KEY));
    const users = readJson(USERS_KEY, {});
    let currentMember = phone ? users?.[phone] : null;

    await waitForFirebaseSession(phone);
    if ((!currentMember?.name || !currentMember?.phone) && window.IrisFirebase?.getMemberProfile) {
      const profile = await window.IrisFirebase.getMemberProfile().catch(() => null);
      if (profile) currentMember = { ...currentMember, ...profile };
    }

    const referrerName = String(currentMember?.name || "").trim();
    if (!phone || !referrerName) {
      ownerTarget.textContent = "로그인한 회원 이름을 기준으로 회원DB를 표시합니다.";
      renderMetrics([]);
      renderRows([]);
      return;
    }

    ownerTarget.innerHTML = `<strong>${escapeHtml(referrerName)}</strong> 님을 추천인으로 등록한 회원입니다.`;

    let remoteMembers = [];
    if (window.IrisFirebase?.listReferralMembers) {
      remoteMembers = await window.IrisFirebase.listReferralMembers(referrerName).catch((error) => {
        console.warn("회원DB Firebase 목록을 불러오지 못했습니다.", error);
        return [];
      });
    }

    const sheetMembers = await listReferralMembersFromSheet(referrerName);
    const localMembers = collectLocalReferralMembers(referrerName, users);
    const members = mergeMembers(remoteMembers, sheetMembers, localMembers);
    renderMetrics(members);
    renderRows(members);
  }

  async function listReferralMembersFromSheet(referrerName) {
    const scriptUrl = localStorage.getItem(GOOGLE_SCRIPT_URL_KEY) || DEFAULT_GOOGLE_SCRIPT_URL;
    if (!scriptUrl || !referrerName) return [];
    try {
      const url = new URL(scriptUrl);
      url.searchParams.set("type", "referral_members");
      url.searchParams.set("referrer", referrerName);
      const response = await fetch(url.toString(), { method: "GET" });
      const result = await response.json().catch(() => ({}));
      return Array.isArray(result.members) ? result.members.map((member) => ({
        ...member,
        irisSummary: member.irisSummary || { hasPhoto: false, photoState: {}, markerCount: 0, topObservations: [] }
      })) : [];
    } catch (error) {
      console.warn("회원DB Google Sheet 목록을 불러오지 못했습니다.", error);
      return [];
    }
  }

  function collectLocalReferralMembers(referrerName, users) {
    const referrerKey = normalizeName(referrerName);
    return Object.entries(users || {})
      .filter(([, member]) => normalizeName(member?.referrer) === referrerKey)
      .map(([phone, member]) => {
        const memberPhone = normalizePhone(member.phone || phone);
        return {
          id: `local-${memberPhone}`,
          memberPhone,
          memberName: member.name || "",
          memberEmail: member.email || "",
          memberAddress: member.address || "",
          memberNo: member.memberNo || "",
          joinedAt: member.joinedAt || member.createdAt || "",
          referrer: member.referrer || "",
          updatedAtText: member.updatedAt || member.createdAt || "",
          irisSummary: buildLocalIrisSummary(memberPhone),
          source: "local"
        };
      });
  }

  function buildLocalIrisSummary(phone) {
    const photoState = readJson(`irisEyePhotoState:${phone}`, {});
    const rightMarkers = readJson(`irisEyeMarkers:${phone}:right`, []);
    const leftMarkers = readJson(`irisEyeMarkers:${phone}:left`, []);
    const result = readJson("irisReadingResult", null);
    const resultOwner = normalizePhone(result?.accountPhone);
    const resultForMember = resultOwner && resultOwner === phone ? result : null;
    return {
      hasPhoto: Boolean(photoState?.right || photoState?.left),
      photoState: { right: Boolean(photoState?.right), left: Boolean(photoState?.left) },
      markerCount: (Array.isArray(rightMarkers) ? rightMarkers.length : 0) + (Array.isArray(leftMarkers) ? leftMarkers.length : 0),
      latestReadingAt: resultForMember?.createdAt || "",
      observationMode: resultForMember?.observationMode || "",
      topObservations: collectObservations(resultForMember).slice(0, 8)
    };
  }

  function collectObservations(result) {
    if (!result) return [];
    const source = result.manualObservations || result.allObservations || { right: result.right || [], left: result.left || [] };
    return ["right", "left"].flatMap((eyeKey) => {
      const eye = eyeKey === "left" ? "좌안" : "우안";
      const items = Array.isArray(source?.[eyeKey]) ? source[eyeKey] : [];
      return items.map((item) => ({
        eye,
        code: item.code || "",
        area: item.area || item.organ || item.title || item.code || "미분류",
        type: item.type || item.pattern || "",
        score: Number(item.score || item.priorityScore || 0) || 0
      }));
    }).sort((a, b) => b.score - a.score);
  }

  function mergeMembers(...memberGroups) {
    const map = new Map();
    memberGroups.flat().forEach((member) => {
      const key = normalizePhone(member.memberPhone || member.phone) || member.memberUid || member.id;
      if (!key) return;
      map.set(key, { ...(map.get(key) || {}), ...member });
    });
    return [...map.values()].sort((a, b) => String(b.updatedAtText || b.joinedAt || "").localeCompare(String(a.updatedAtText || a.joinedAt || "")));
  }

  function renderMetrics(members) {
    const withIris = members.filter((member) => member.irisSummary?.hasPhoto || member.irisSummary?.markerCount).length;
    const withReading = members.filter((member) => member.irisSummary?.latestReadingAt).length;
    metricsTarget.innerHTML = [
      ["추천 회원", members.length],
      ["홍채자료 있음", withIris],
      ["판독 저장", withReading],
      ["오늘 확인", new Date().toLocaleDateString("ko-KR")]
    ].map(([label, value]) => `<article class="card metric"><strong>${escapeHtml(label)}</strong><b>${escapeHtml(value)}</b></article>`).join("");
  }

  function renderRows(members) {
    if (!members.length) {
      rowsTarget.innerHTML = `<tr><td colspan="6"><div class="empty">내 이름을 추천인으로 등록한 회원이 아직 없습니다.</div></td></tr>`;
      return;
    }
    rowsTarget.innerHTML = members.map((member) => {
      const iris = member.irisSummary || {};
      const observations = Array.isArray(iris.topObservations) ? iris.topObservations : [];
      return `<tr>
        <td><strong>${escapeHtml(member.memberName || "-")}</strong><br><span class="muted">${escapeHtml(member.memberNo || "-")}</span></td>
        <td>${escapeHtml(member.memberPhone || "-")}<br><span class="muted">${escapeHtml(member.memberEmail || "-")}</span></td>
        <td>주소: ${escapeHtml(member.memberAddress || "-")}<br>가입일: ${escapeHtml(formatDate(member.joinedAt))}<br>추천인: ${escapeHtml(member.referrer || "-")}</td>
        <td>사진: <strong>${iris.hasPhoto ? "있음" : "없음"}</strong><br>우안: ${iris.photoState?.right ? "있음" : "없음"} / 좌안: ${iris.photoState?.left ? "있음" : "없음"}<br>수동체크: ${Number(iris.markerCount || 0)}개</td>
        <td>${observations.length ? observations.map((item) => `<span class="pill">${escapeHtml(item.eye)} ${escapeHtml(item.area)} ${escapeHtml(item.type || "")}</span>`).join("") : '<span class="muted">관찰 요약 없음</span>'}</td>
        <td>${escapeHtml(formatDate(iris.latestReadingAt || member.updatedAtText || member.joinedAt))}</td>
      </tr>`;
    }).join("");
  }

  function waitForFirebaseSession(phone) {
    return new Promise((resolve) => {
      if (!window.IRIS_FIREBASE_CONFIG) {
        resolve();
        return;
      }
      let count = 0;
      const timer = setInterval(() => {
        count += 1;
        const ready = Boolean(window.IrisFirebase?.ready);
        const signedIn = !phone || Boolean(window.IrisFirebase?.getCurrentUser?.());
        if ((ready && signedIn) || count > 80) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
  }

  function normalizePhone(value) {
    let digits = String(value || "").replace(/\D/g, "");
    if (digits.startsWith("0082")) digits = digits.slice(4);
    if (digits.startsWith("82")) digits = digits.slice(2);
    if (digits.length === 10 && digits.startsWith("10")) digits = `0${digits}`;
    return digits;
  }

  function normalizeName(value) {
    return String(value || "").replace(/\s+/g, "").trim().toLowerCase();
  }

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
    } catch (_) {
      return fallback;
    }
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString("ko-KR");
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
  }
})();
