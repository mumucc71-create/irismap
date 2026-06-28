const ADMIN_EMAIL = "mumu5499@hanmail.net";
const SHEET_NAME = "쇼핑알림";

function doPost(e) {
  const data = e && e.parameter ? e.parameter : {};
  const source = data.source || "consult";
  const createdAt = data.createdAt || new Date().toISOString();
  const sheet = getSheet_();

  const itemsText = buildItemsText_(data.orderItems);
  const totalText = data.total ? Number(data.total).toLocaleString("ko-KR") + "원" : "";

  sheet.appendRow([
    new Date(),
    createdAt,
    source,
    data.name || "",
    data.phone || "",
    data.availableTime || "",
    data.memo || "",
    data.orderId || "",
    itemsText,
    totalText,
    data.page || ""
  ]);

  const subject = source === "order"
    ? "[IRIS MAPPING LAB] 쇼핑 주문 알림"
    : "[IRIS MAPPING LAB] 쇼핑 상담요청";

  const body = source === "order"
    ? [
        "쇼핑 주문 알림이 접수되었습니다.",
        "",
        "주문번호: " + (data.orderId || ""),
        "이름: " + (data.name || ""),
        "연락처: " + (data.phone || ""),
        "주문 상품:",
        itemsText || "상품 정보 없음",
        "총 금액: " + totalText,
        "메모: " + (data.memo || ""),
        "페이지: " + (data.page || ""),
        "접수일시: " + createdAt
      ].join("\n")
    : [
        "쇼핑 상담요청이 접수되었습니다.",
        "",
        "이름: " + (data.name || ""),
        "연락처: " + (data.phone || ""),
        "상담 가능 시간: " + (data.availableTime || ""),
        "페이지: " + (data.page || ""),
        "접수일시: " + createdAt
      ].join("\n");

  MailApp.sendEmail(ADMIN_EMAIL, subject, body);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["저장일시", "접수일시", "구분", "이름", "연락처", "상담 가능 시간", "메모", "주문번호", "주문상품", "총금액", "페이지"]);
  }
  return sheet;
}

function buildItemsText_(orderItems) {
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
