const ADMIN_EMAIL = "mumu5499@hanmail.net";
const SHEET_NAME = "쇼핑알림";

function doPost(e) {
  const data = parsePostData_(e);
  const type = data.type || data.source || "상담";
  const createdAt = data.createdAt || new Date().toISOString();
  const sheet = getSheet_();
  const memo = getMemo_(data);
  const address = getAddress_(data);

  const itemsText = buildItemsText_(data.orderItems, data);
  const totalText = data.total ? Number(data.total).toLocaleString("ko-KR") + "원" : "";

  sheet.appendRow([
    new Date(),
    createdAt,
    type,
    data.name || "",
    data.phone || "",
    data.email || "",
    data.availableTime || "",
    address,
    memo,
    data.orderId || "",
    itemsText,
    totalText,
    data.page || ""
  ]);

  const subject = type === "주문" || type === "order"
    ? "[IRIS MAPPING LAB] 쇼핑 주문 알림"
    : "[IRIS MAPPING LAB] 상담요청";

  const body = type === "주문" || type === "order" ? buildOrderBody_(data, itemsText, totalText, createdAt, memo, address) : buildConsultBody_(data, createdAt, memo);
  const mailResult = sendAdminMail_(subject, body);

  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      success: true,
      saved: true,
      emailSent: mailResult.sent,
      emailError: mailResult.error
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendAdminMail_(subject, body) {
  try {
    MailApp.sendEmail(ADMIN_EMAIL, subject, body);
    return { sent: true, error: "" };
  } catch (error) {
    return {
      sent: false,
      error: error && error.message ? error.message : String(error)
    };
  }
}

function parsePostData_(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (_) {
      return e.parameter || {};
    }
  }
  return e && e.parameter ? e.parameter : {};
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["저장일시", "접수일시", "구분", "이름", "연락처", "이메일", "상담 가능 시간", "주소", "문의내용", "주문번호", "주문상품", "총금액", "페이지"]);
  }
  return sheet;
}

function getMemo_(data) {
  return data.message || data.memo || data.content || data.inquiry || data["문의내용"] || "";
}

function getAddress_(data) {
  return data.address || data.shippingAddress || data.addr || data["주소"] || "";
}

function buildConsultBody_(data, createdAt, memo) {
  return [
    "상담요청이 접수되었습니다.",
    "",
    "이름: " + (data.name || ""),
    "연락처: " + (data.phone || ""),
    "이메일: " + (data.email || ""),
    "문의내용: " + memo,
    "페이지: " + (data.page || ""),
    "접수일시: " + createdAt
  ].join("\n");
}

function buildOrderBody_(data, itemsText, totalText, createdAt, memo, address) {
  return [
    "쇼핑 주문이 접수되었습니다.",
    "",
    "주문번호: " + (data.orderId || ""),
    "이름: " + (data.name || ""),
    "연락처: " + (data.phone || ""),
    "이메일: " + (data.email || ""),
    "주소: " + address,
    "주문 상품:",
    itemsText || "상품 정보 없음",
    "총 금액: " + totalText,
    "메모: " + memo,
    "페이지: " + (data.page || ""),
    "접수일시: " + createdAt
  ].join("\n");
}

function buildItemsText_(orderItems, data) {
  if (data && (data.orderItemsText || data.products || data.productSummary || data["주문상품"])) {
    return data.orderItemsText || data.products || data.productSummary || data["주문상품"];
  }
  if (!orderItems) return "";
  try {
    const items = JSON.parse(orderItems);
    if (!Array.isArray(items)) return String(orderItems);
    return items.map((item) => {
      const name = item.name || "상품명 없음";
      const quantity = item.quantity || 1;
      const price = Number(item.salePrice || 0).toLocaleString("ko-KR") + "원";
      return "- " + name + " x " + quantity + " / " + price;
    }).join("\n");
  } catch (_) {
    return String(orderItems);
  }
}
