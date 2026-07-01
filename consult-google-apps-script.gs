const ADMIN_EMAIL = "mumu5499@hanmail.net";
const SPREADSHEET_ID = "1yRArb4zM59y4-NW8ncvosaghzPdRRyYrnM5cwMVr2DY";
const REQUEST_SHEET_NAME = "상담주문";
const MEMBER_SHEET_NAME = "회원가입";

function doPost(e) {
  const data = parsePostData_(e);
  const type = data.type || data.source || "상담";

  if (type === "member" || type === "회원가입") {
    return appendMemberSignup_(data);
  }

  return appendRequest_(data, type);
}

function appendMemberSignup_(data) {
  const sheet = getSheet_(MEMBER_SHEET_NAME, [
    "저장일시",
    "가입일",
    "회원번호",
    "이름",
    "전화번호",
    "정규화전화번호",
    "이메일",
    "주소",
    "추천인",
    "페이지"
  ]);

  sheet.appendRow([
    new Date(),
    data.joinedAt || "",
    data.memberNo || "",
    data.name || "",
    data.phone || "",
    data.phoneKey || "",
    data.email || "",
    data.address || "",
    data.referrer || "",
    data.page || ""
  ]);

  return json_({ ok: true, success: true, saved: true, type: "member" });
}

function appendRequest_(data, type) {
  const createdAt = data.createdAt || new Date().toISOString();
  const memo = getMemo_(data);
  const address = getAddress_(data);
  const itemsText = buildItemsText_(data.orderItems, data);
  const totalText = data.total ? Number(data.total).toLocaleString("ko-KR") + "원" : "";
  const sheet = getSheet_(REQUEST_SHEET_NAME, [
    "저장일시",
    "접수일시",
    "구분",
    "이름",
    "연락처",
    "이메일",
    "상담 가능 시간",
    "주소",
    "문의내용",
    "주문번호",
    "주문상품",
    "총금액",
    "페이지"
  ]);

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
    data.orderId || data.id || "",
    itemsText,
    totalText,
    data.page || ""
  ]);

  const isOrder = type === "주문" || type === "order";
  const subject = isOrder
    ? "[IRIS MAPPING LAB] 쇼핑 주문 알림"
    : "[IRIS MAPPING LAB] 상담 요청";
  const body = isOrder
    ? buildOrderBody_(data, itemsText, totalText, createdAt, memo, address)
    : buildConsultBody_(data, createdAt, memo);
  const mailResult = sendAdminMail_(subject, body);

  return json_({
    ok: true,
    success: true,
    saved: true,
    emailSent: mailResult.sent,
    emailError: mailResult.error
  });
}

function getSheet_(name, headers) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  return sheet;
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

function getMemo_(data) {
  return data.message || data.memo || data.content || data.inquiry || "";
}

function getAddress_(data) {
  return data.address || data.shippingAddress || data.addr || "";
}

function buildConsultBody_(data, createdAt, memo) {
  return [
    "상담 요청이 접수되었습니다.",
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
    "주문번호: " + (data.orderId || data.id || ""),
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
  if (data && (data.orderItemsText || data.products || data.productSummary)) {
    return data.orderItemsText || data.products || data.productSummary;
  }
  if (!orderItems) return "";
  try {
    const items = typeof orderItems === "string" ? JSON.parse(orderItems) : orderItems;
    if (!Array.isArray(items)) return String(orderItems);
    return items.map((item) => {
      const name = item.name || "상품명 없음";
      const quantity = item.quantity || 1;
      const price = Number(item.salePrice || item.price || 0).toLocaleString("ko-KR") + "원";
      return "- " + name + " x " + quantity + " / " + price;
    }).join("\n");
  } catch (_) {
    return String(orderItems);
  }
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
