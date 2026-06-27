const catalog = window.shoppingRecommendationDB || { productGroupDB: [] };
const store = window.ProductDB;
const form = document.querySelector("#productForm");
const status = document.querySelector("#status");
const imageFile = document.querySelector("#imageFile");
const imageUrl = document.querySelector("#imageUrl");
const preview = document.querySelector("#imagePreview");
const cancelButton = document.querySelector("#productCancelButton");
const settingsForm = document.querySelector("#displaySettingsForm");
const settingsStatus = document.querySelector("#settingsStatus");
let uploadedImage = "";
let editingImage = "";
let products = store.read();
let operatorSettings = readJson("irisShoppingOperatorSettings", { ingredientReasons: {}, camera: {} });

const categories = catalog.productGroupDB || [];
form.elements.category.innerHTML = categories.length
  ? categories.map((group) => '<option value="' + escapeHtml(group.id) + '">' + escapeHtml(group.title) + "</option>").join("")
  : '<option value="기타">기타</option>';

loadSettingsForm();
renderSavedReasons();
renderProducts();

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(settingsForm).entries());
  const ingredientName = String(data.ingredientName || "").trim();
  const ingredientReason = String(data.ingredientReason || "").trim();
  if (ingredientName && ingredientReason) operatorSettings.ingredientReasons[ingredientName] = ingredientReason;
  operatorSettings.camera = {
    name: String(data.cameraName || "홍채촬영도구").trim(),
    price: Number(data.cameraPrice) || 120000,
    url: String(data.cameraUrl || "").trim(),
    description: String(data.cameraDescription || "홍채 사진 촬영용 도구입니다.").trim()
  };
  saveOperatorSettings();
  settingsForm.elements.ingredientName.value = "";
  settingsForm.elements.ingredientReason.value = "";
  renderSavedReasons();
  settingsStatus.textContent = "쇼핑몰 표시 설정을 저장했습니다.";
});

imageFile.addEventListener("change", async () => {
  const file = imageFile.files?.[0];
  if (!file) return;
  try {
    status.textContent = "상품 사진을 준비하고 있습니다.";
    uploadedImage = await resizeImage(file, 900, 0.82);
    showPreview(uploadedImage);
    status.textContent = "상품 사진이 준비되었습니다.";
  } catch (_) {
    uploadedImage = "";
    status.textContent = "상품 사진을 읽지 못했습니다. 다른 사진을 선택해 주세요.";
  }
});

imageUrl.addEventListener("input", () => {
  if (!uploadedImage) showPreview(imageUrl.value.trim() || editingImage);
});

cancelButton.addEventListener("click", resetProductForm);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const finalImage = uploadedImage || String(data.imageUrl || "").trim() || editingImage;
  if (!finalImage) {
    status.textContent = "상품 사진을 업로드하거나 이미지 URL을 입력해 주세요.";
    imageFile.focus();
    return;
  }

  const existing = products.find((item) => item.productId === data.productId);
  const searchKeywords = store.toList(data.searchKeywords);
  const product = store.normalize({
    ...existing,
    productId: existing?.productId || "P" + Date.now(),
    name: data.name,
    brand: data.brand,
    category: data.category,
    displayGroup: data.displayGroup,
    recommendedIngredients: store.toList(data.recommendedIngredients),
    targetKeywords: store.toList(data.targetKeywords),
    searchKeywords,
    description: data.description,
    reason: data.reason,
    imageUrl: finalImage,
    officialUrl: data.officialUrl,
    naverSearchUrl: data.naverSearchUrl || store.makeNaverSearchUrl(searchKeywords[0] || data.name),
    purchaseUrl: data.purchaseUrl,
    wholesalePrice: data.wholesalePrice,
    salePrice: data.salePrice,
    stock: data.stock,
    visible: data.visible === "on",
    priority: data.priority,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const nextProducts = existing
    ? products.map((item) => item.productId === existing.productId ? product : item)
    : [...products, product];
  try {
    products = store.write(nextProducts);
  } catch (_) {
    status.textContent = "저장 공간이 부족합니다. 더 작은 상품 사진을 사용해 주세요.";
    return;
  }
  const message = existing ? "상품 설정을 수정했습니다." : "상품을 ProductDB에 저장했습니다.";
  resetProductForm();
  renderProducts();
  status.textContent = message;
});

function editProduct(productId) {
  const product = products.find((item) => item.productId === productId);
  if (!product) return;
  form.elements.productId.value = product.productId;
  form.elements.name.value = product.name || "";
  form.elements.brand.value = product.brand || "";
  form.elements.category.value = product.category || "";
  form.elements.displayGroup.value = product.displayGroup || "personal";
  form.elements.recommendedIngredients.value = (product.recommendedIngredients || []).join(", ");
  form.elements.targetKeywords.value = (product.targetKeywords || []).join("\n");
  form.elements.searchKeywords.value = (product.searchKeywords || []).join("\n");
  form.elements.description.value = product.description || "";
  form.elements.reason.value = product.reason || "";
  form.elements.imageUrl.value = product.imageUrl?.startsWith("data:") ? "" : product.imageUrl || "";
  form.elements.purchaseUrl.value = product.purchaseUrl || "";
  form.elements.officialUrl.value = product.officialUrl || "";
  form.elements.naverSearchUrl.value = product.naverSearchUrl || "";
  form.elements.wholesalePrice.value = product.wholesalePrice || 0;
  form.elements.salePrice.value = product.salePrice || 0;
  form.elements.stock.value = product.stock || 0;
  form.elements.visible.checked = product.visible !== false;
  form.elements.priority.value = product.priority || 100;
  editingImage = product.imageUrl || "";
  uploadedImage = "";
  showPreview(editingImage);
  document.querySelector("#productFormTitle").textContent = "상품 수정";
  document.querySelector("#productSaveButton").textContent = "수정 저장";
  cancelButton.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetProductForm() {
  form.reset();
  form.elements.productId.value = "";
  form.elements.visible.checked = true;
  form.elements.priority.value = "100";
  uploadedImage = "";
  editingImage = "";
  preview.hidden = true;
  preview.removeAttribute("src");
  document.querySelector("#productFormTitle").textContent = "상품 등록";
  document.querySelector("#productSaveButton").textContent = "상품 저장";
  cancelButton.hidden = true;
}

function renderProducts() {
  const titles = Object.fromEntries(categories.map((group) => [group.id, group.title]));
  const groupTitles = { basic:"기본 필수", personal:"개인별 필수", preference:"기호식품" };
  document.querySelector("#productRows").innerHTML = products.length
    ? products.slice().sort((a,b) => Number(a.priority || 100) - Number(b.priority || 100)).map((product) =>
        '<tr><td>' + (product.imageUrl ? '<img class="thumb" src="' + escapeHtml(product.imageUrl) + '" alt="">' : '<span class="muted">사진 없음</span>') +
        '</td><td><strong>' + escapeHtml(product.name) + '</strong><br><span class="muted">' + escapeHtml(product.brand) + '</span></td>' +
        '<td>' + escapeHtml(groupTitles[product.displayGroup] || "개인별 필수") + '</td><td>' + escapeHtml(titles[product.category] || product.category) + '</td><td>' + escapeHtml((product.targetKeywords || []).join(", ")) + '</td>' +
        '<td>' + Number(product.salePrice || 0).toLocaleString("ko-KR") + '원</td><td>' + Number(product.stock || 0).toLocaleString("ko-KR") + '</td>' +
        '<td class="' + (product.visible ? "status-visible" : "status-hidden") + '">' + (product.visible ? "노출" : "숨김") + '</td><td>' + Number(product.priority || 100) + '</td>' +
        '<td><button type="button" data-edit="' + escapeHtml(product.productId) + '">수정</button> <button type="button" data-delete="' + escapeHtml(product.productId) + '">삭제</button></td></tr>'
      ).join("")
    : '<tr><td colspan="10" class="muted">등록된 상품이 없습니다.</td></tr>';
  document.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => editProduct(button.dataset.edit)));
  document.querySelectorAll("[data-delete]").forEach((button) => button.addEventListener("click", () => {
    const product = products.find((item) => item.productId === button.dataset.delete);
    if (!product || !confirm(product.name + " 상품을 삭제할까요?")) return;
    products = store.write(products.filter((item) => item.productId !== button.dataset.delete));
    renderProducts();
    status.textContent = "상품을 삭제했습니다.";
  }));
}

function loadSettingsForm() {
  const camera = operatorSettings.camera || {};
  settingsForm.elements.cameraName.value = camera.name || "홍채촬영도구";
  settingsForm.elements.cameraPrice.value = camera.price || 120000;
  settingsForm.elements.cameraUrl.value = camera.url || "";
  settingsForm.elements.cameraDescription.value = camera.description || "홍채 사진 촬영용 도구입니다.";
}

function renderSavedReasons() {
  const entries = Object.entries(operatorSettings.ingredientReasons || {});
  document.querySelector("#savedIngredientReasons").innerHTML = entries.length
    ? entries.map(([name,reason]) => '<div class="saved-reason"><span><strong>' + escapeHtml(name) + '</strong><br><span class="muted">' + escapeHtml(reason) + '</span></span><button type="button" data-reason-delete="' + escapeHtml(name) + '">삭제</button></div>').join("")
    : '<p class="muted">운영자가 따로 설정한 성분 추천 이유가 없습니다.</p>';
  document.querySelectorAll("[data-reason-delete]").forEach((button) => button.addEventListener("click", () => {
    delete operatorSettings.ingredientReasons[button.dataset.reasonDelete];
    saveOperatorSettings();
    renderSavedReasons();
  }));
}

function saveOperatorSettings() { localStorage.setItem("irisShoppingOperatorSettings", JSON.stringify(operatorSettings)); }
function readJson(key,fallback) { try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch (_) { return fallback; } }
function showPreview(src) { if (!src) { preview.hidden=true; preview.removeAttribute("src"); return; } preview.src=src; preview.hidden=false; }
function resizeImage(file,maxSize,quality) { return new Promise((resolve,reject) => { const reader=new FileReader(); reader.onerror=reject; reader.onload=() => { const image=new Image(); image.onerror=reject; image.onload=() => { const scale=Math.min(1,maxSize/Math.max(image.width,image.height)); const canvas=document.createElement("canvas"); canvas.width=Math.max(1,Math.round(image.width*scale)); canvas.height=Math.max(1,Math.round(image.height*scale)); canvas.getContext("2d").drawImage(image,0,0,canvas.width,canvas.height); resolve(canvas.toDataURL("image/jpeg",quality)); }; image.src=reader.result; }; reader.readAsDataURL(file); }); }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char])); }
