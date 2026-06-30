(function () {
  "use strict";

  if (document.documentElement.classList.contains("embedded-universe")) return;

  const SESSION_KEY = "irisMappingSession";
  const FIREBASE_CONFIG_SCRIPT = "firebase-config.js?v=20260630-marker-sync-1";
  const FIREBASE_SYNC_SCRIPT = "firebase-sync.js?v=20260630-marker-sync-1";
  const ROUTES = {
    home: { label: "홈", href: "index.html" },
    health: { label: "라이프진단", href: "health.html" },
    iris: { label: "홍채촬영", href: "iris.html" },
    total: { label: "총결과", href: "final-report.html" },
    shopping: { label: "쇼핑하기", href: "shopping.html" },
    subscription: { label: "구독하기", href: "subscription.html" },
    center: { label: "건강체험센터", href: "center.html" },
    insurance: { label: "AI보험", href: "ai-health.html" },
    reservation: { label: "예약하기", href: "reservation.html" },
    mypage: { label: "마이페이지", href: "mypage.html" }
  };

  const PAGE_KEYS = {
    "index.html": "home", "": "home", "iris.html": "iris", "reading.html": "iris",
    "health.html": "health", "universe.html": "insurance", "universe-upload.html": "insurance",
    "final-report.html": "total", "shopping.html": "shopping", "cart.html": "shopping", "subscription.html": "subscription",
    "subscribe.html": "subscription", "center.html": "center", "ai-health.html": "insurance",
    "insurance.html": "insurance", "reservation.html": "reservation", "mypage.html": "mypage",
    "cases.html": "total"
  };

  const CTA = {
    "iris.html": [],
    "reading.html": [["문진 입력하기", "health.html"], ["총결과 보기", "final-report.html"], ["쇼핑 추천 보기", "shopping.html"], ["구독 관리 보기", "subscription.html"]],
    "health.html": [["홍채촬영", "iris.html"], ["총결과 보기", "final-report.html"], ["AI보험·유니버스", "ai-health.html"]],
    "universe.html": [["AI보험상담", "ai-health.html"], ["총결과 보기", "final-report.html"], ["쇼핑 추천 보기", "shopping.html"]],
    "final-report.html": [["홍채촬영", "iris.html"], ["라이프진단", "health.html"], ["쇼핑하기", "shopping.html"], ["구독하기", "subscription.html"]],
    "shopping.html": []
  };

  function currentFile() {
    return decodeURIComponent(location.pathname.split("/").pop() || "index.html").toLowerCase();
  }

  function loggedIn() {
    const sessionPhone = String(localStorage.getItem(SESSION_KEY) || "").replace(/\D/g, "");
    const appIsOpen = Boolean(document.querySelector("#appShell:not([hidden])"));
    return Boolean(sessionPhone || appIsOpen);
  }

  function requiresLogin(file) {
    return !["index.html", "iris.html", "admin.html", ""].includes(file);
  }

  function routeLink(key, activeKey, guest) {
    const route = ROUTES[key];
    const label = guest && route.guestLabel ? route.guestLabel : route.label;
    const active = key === activeKey;
    return `<a class="iris-site-nav__link${active ? " is-active" : ""}" href="${route.href}"${active ? ' aria-current="page"' : ""}>${label}</a>`;
  }

  function hideLegacyHomeLinks() {
    const homeLabels = new Set(["홈", "홈으로", "메인으로", "메인 화면"]);
    document.querySelectorAll("header a").forEach((element) => {
      if (!element.closest(".iris-site-nav")) element.classList.add("iris-legacy-home-link");
    });
    document.querySelectorAll("header button").forEach((element) => {
      if (!element.closest(".iris-site-nav") && homeLabels.has(element.textContent.trim())) element.classList.add("iris-legacy-home-link");
    });
    const oldLandingHeader = document.querySelector("header.site-header");
    if (oldLandingHeader) oldLandingHeader.classList.add("iris-nav-replaced");
  }

  function buildHeader(file, activeKey, isLoggedIn) {
    const keys = isLoggedIn
      ? ["home", "iris", "health", "insurance", "total", "shopping", "subscription", "mypage"]
      : ["home", "iris", "health", "insurance", "shopping", "subscription"];
    const header = document.createElement("header");
    header.className = "iris-site-nav";
    header.innerHTML = `<div class="iris-site-nav__inner"><a class="iris-site-nav__brand" href="index.html"><img src="assets/logo.jpg" alt=""><span>IRIS MAPPING LAB</span></a><nav class="iris-site-nav__links" aria-label="전체 서비스 메뉴">${keys.map((key) => routeLink(key, activeKey, !isLoggedIn)).join("")}</nav><div class="iris-site-nav__session">${isLoggedIn ? '<button class="iris-site-nav__link" id="irisCommonLogout" type="button">로그아웃</button>' : '<a class="iris-site-nav__link" href="iris.html">로그인</a>'}</div></div>`;
    document.body.prepend(header);
    const logout = document.querySelector("#irisCommonLogout");
    if (logout) logout.addEventListener("click", () => {
      localStorage.removeItem(SESSION_KEY);
      location.href = "iris.html";
    });
  }

  function buildMobileTabs(activeKey, isLoggedIn) {
    const analysisActive = ["iris", "health"].includes(activeKey);
    const resultActive = ["total", "insurance"].includes(activeKey);
    const tabs = document.createElement("nav");
    tabs.className = "iris-mobile-tabs";
    tabs.setAttribute("aria-label", "모바일 빠른 메뉴");
    tabs.innerHTML = `<a class="iris-mobile-tabs__item${activeKey === "home" ? " is-active" : ""}" href="index.html">홈</a><button class="iris-mobile-tabs__item${analysisActive ? " is-active" : ""}" type="button" data-mobile-menu="analysis">분석</button><button class="iris-mobile-tabs__item${resultActive ? " is-active" : ""}" type="button" data-mobile-menu="result">결과</button><a class="iris-mobile-tabs__item${activeKey === "shopping" ? " is-active" : ""}" href="shopping.html">쇼핑</a><a class="iris-mobile-tabs__item${activeKey === "mypage" ? " is-active" : ""}" href="${isLoggedIn ? "mypage.html" : "iris.html"}">마이</a>`;
    const analysisMenu = mobileMenu("analysis", [["홍채촬영", "iris.html"], ["라이프진단", "health.html"]], activeKey);
    const resultMenu = mobileMenu("result", [["AI보험·유니버스", "ai-health.html"], ["총결과", "final-report.html"]], activeKey);
    document.body.append(tabs, analysisMenu, resultMenu);
    tabs.querySelectorAll("[data-mobile-menu]").forEach((button) => button.addEventListener("click", () => {
      const target = document.querySelector(`[data-menu-panel="${button.dataset.mobileMenu}"]`);
      document.querySelectorAll(".iris-mobile-menu").forEach((menu) => { if (menu !== target) menu.hidden = true; });
      target.hidden = !target.hidden;
    }));
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".iris-mobile-tabs") && !event.target.closest(".iris-mobile-menu")) document.querySelectorAll(".iris-mobile-menu").forEach((menu) => { menu.hidden = true; });
    });
  }

  function mobileMenu(name, items, activeKey) {
    const menu = document.createElement("div");
    menu.className = "iris-mobile-menu";
    menu.dataset.menuPanel = name;
    menu.hidden = true;
    menu.innerHTML = items.map(([label, href]) => `<a href="${href}">${label}</a>`).join("");
    return menu;
  }

  function buildPageCta(file) {
    const items = CTA[file];
    if (!items || !items.length) return;
    const section = document.createElement("section");
    section.className = "iris-page-cta";
    section.setAttribute("aria-label", "다음 단계");
    section.innerHTML = `<h2>다음 단계</h2><div class="iris-page-cta__actions">${items.map(([label, href]) => `<a class="iris-page-cta__link" href="${href}">${label}</a>`).join("")}</div>`;
    document.body.append(section);
  }

  function prepareAnchors(file) {
    if (file === "final-report.html") {
      const existingLifeSection = document.querySelector("#life-diagnosis");
      if (!existingLifeSection) {
        const strategy = document.querySelector("#lifeStrategy")?.closest("section");
        if (strategy) strategy.id = "life-diagnosis";
      }
    }
    if (file === "subscription.html") {
      const dashboard = document.querySelector("#dashboard")?.closest("section");
      const box = document.querySelector("#box")?.closest("section");
      if (dashboard) dashboard.id = "subscription-dashboard";
      if (box) box.id = "health-box";
    }
    if (location.hash) requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView({ block: "start" }));
  }

  function renderNavigation(file, activeKey, isLoggedIn) {
    document.querySelectorAll(".iris-site-nav, .iris-mobile-tabs, .iris-mobile-menu, .iris-page-cta").forEach((element) => element.remove());
    buildHeader(file, activeKey, isLoggedIn);
    hideLegacyHomeLinks();
    buildMobileTabs(activeKey, isLoggedIn);
    buildPageCta(file);
  }

  function init() {
    loadFirebaseSync();
    const file = currentFile();
    const activeKey = PAGE_KEYS[file] || "";
    const isLoggedIn = loggedIn();
    if (!isLoggedIn && requiresLogin(file)) {
      const target = `${file}${location.search || ""}${location.hash || ""}`;
      location.href = `iris.html?next=${encodeURIComponent(target)}`;
      return;
    }
    prepareAnchors(file);
    renderNavigation(file, activeKey, isLoggedIn);
  }

  function loadFirebaseSync() {
    if (document.querySelector("script[data-iris-firebase-sync]")) return;
    const config = document.createElement("script");
    config.src = FIREBASE_CONFIG_SCRIPT;
    config.dataset.irisFirebaseConfig = "1";
    config.onload = () => {
      const sync = document.createElement("script");
      sync.type = "module";
      sync.src = FIREBASE_SYNC_SCRIPT;
      sync.dataset.irisFirebaseSync = "1";
      document.head.appendChild(sync);
    };
    document.head.appendChild(config);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.addEventListener("irisAuthChanged", () => {
    const file = currentFile();
    renderNavigation(file, PAGE_KEYS[file] || "", loggedIn());
  });
})();
