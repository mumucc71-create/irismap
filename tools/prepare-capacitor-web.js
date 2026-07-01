const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "www");

const includeFiles = [
  "admin.html",
  "admin.js",
  "ai-health.html",
  "app.js",
  "care-engine.js",
  "cart.html",
  "cases.html",
  "center.html",
  "consult-settings.html",
  "final-report.html",
  "firebase-config.js",
  "firebase-sync.js",
  "health.html",
  "index.html",
  "index2.html",
  "insurance.html",
  "integrated-reading-engine.js",
  "iris-dashboard.js",
  "iris-learning.html",
  "iris-map.html",
  "iris-organ-db.js",
  "iris.html",
  "landing-bg-overrides.css",
  "landing.css",
  "landing.js",
  "member-admin.html",
  "member-admin.js",
  "mypage.html",
  "portal-pages.css",
  "product-admin.html",
  "product-admin.js",
  "reading.html",
  "reservation.html",
  "reservation.js",
  "shopping-recommendation-db.js",
  "shopping.html",
  "site-navigation.css",
  "site-navigation.js",
  "styles.css",
  "subscribe.html",
  "subscription.html",
  "subscription.js",
  "universe-upload.html",
  "universe.html",
  "universe.js"
];

const includeDirs = [
  "assets",
  "data",
  "organs",
  "samples"
];

function removeDir(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function ensureDir(target) {
  fs.mkdirSync(target, { recursive: true });
}

function copyFile(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(outDir, relativePath);
  if (!fs.existsSync(source)) return;
  ensureDir(path.dirname(target));
  fs.copyFileSync(source, target);
}

function copyDir(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(outDir, relativePath);
  if (!fs.existsSync(source)) return;
  fs.cpSync(source, target, { recursive: true });
}

removeDir(outDir);
ensureDir(outDir);
includeFiles.forEach(copyFile);
includeDirs.forEach(copyDir);

console.log(`Prepared Capacitor web assets in ${outDir}`);
