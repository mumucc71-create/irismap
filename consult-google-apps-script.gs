var ADMIN_EMAIL = "mumu5499@hanmail.net";
var SPREADSHEET_ID = "1yRArb4zM59y4-NW8ncvosaghzPdRRyYrnM5cwMVr2DY";

var CONSULT_SHEET_NAME = "\uC0C1\uB2F4";
var ORDER_SHEET_NAME = "\uC8FC\uBB38";
var LEGACY_ALERT_SHEET_NAME = "\uC1FC\uD551\uC54C\uB9BC";
var INSURANCE_SHEET_NAME = "\uBCF4\uD5D8\uC0C1\uB2F4";

function doGet(e) {
  var params = e && e.parameter ? e.parameter : {};
  var type = params.type || "";
  if (type === "referral_members") {
    return listReferralMembers_(params.referrer || "");
  }
  return json_({ ok: true, success: true });
}

function doPost(e) {
  var data = parsePostData_(e);
  var type = data.type || data.source || "consult";

  if (type === "member" || type === "member_login") {
    return appendMember_(data, type);
  }
  if (type === "order") {
    return appendOrder_(data, type);
  }
  if (type === "insurance_consult") {
    return appendInsuranceConsult_(data, type);
  }
  return appendConsult_(data, type);
}

function setupTabs() {
  getSheet_(CONSULT_SHEET_NAME, headersConsult_());
  getSheet_(ORDER_SHEET_NAME, headersOrder_());
  getSheet_(LEGACY_ALERT_SHEET_NAME, headersAlert_());
  getSheet_(INSURANCE_SHEET_NAME, headersInsurance_());
}

function appendMember_(data, type) {
  var isLogin = type === "member_login";
  appendMemberAlert_(data, isLogin);

  if (!isLogin) {
    var mailResult = sendAdminMail_("IRIS MAPPING LAB Member signup", buildMemberSignupBody_(data));
    return json_({ ok: true, success: true, saved: true, sheet: LEGACY_ALERT_SHEET_NAME, emailSent: mailResult.sent, emailError: mailResult.error });
  }
  return json_({ ok: true, success: true, saved: true, sheet: LEGACY_ALERT_SHEET_NAME });
}

function appendMemberAlert_(data, isLogin) {
  var sheet = getSheet_(LEGACY_ALERT_SHEET_NAME, headersAlert_());
  var referrerText = data.referrer ? "\uCD94\uCC9C\uC778: " + data.referrer : "";
  sheet.appendRow(Array.of(
    new Date(),
    data.loginAt || data.createdAt || data.joinedAt || new Date().toISOString(),
    isLogin ? "member_login" : "member",
    data.name || "",
    data.phone || data.phoneKey || "",
    data.email || "",
    data.referrer || "",
    data.address || "",
    referrerText,
    "",
    "",
    "",
    data.page || ""
  ));
}

function appendConsult_(data, type) {
  var createdAt = data.createdAt || new Date().toISOString();
  var memo = getMemo_(data);
  var sheet = getSheet_(CONSULT_SHEET_NAME, headersConsult_());
  sheet.appendRow(Array.of(
    new Date(),
    createdAt,
    type,
    data.name || "",
    data.phone || "",
    data.email || "",
    data.availableTime || "",
    memo,
    data.page || ""
  ));

  var mailResult = sendAdminMail_("IRIS MAPPING LAB Consult request", buildConsultBody_(data, createdAt, memo));
  return json_({ ok: true, success: true, saved: true, sheet: CONSULT_SHEET_NAME, emailSent: mailResult.sent, emailError: mailResult.error });
}

function appendOrder_(data, type) {
  var createdAt = data.createdAt || new Date().toISOString();
  var memo = getMemo_(data);
  var address = getAddress_(data);
  var itemsText = buildItemsText_(data.orderItems, data);
  var totalText = data.total ? Number(data.total).toLocaleString("ko-KR") + "\uC6D0" : "";
  var sheet = getSheet_(ORDER_SHEET_NAME, headersOrder_());
  sheet.appendRow(Array.of(
    new Date(),
    createdAt,
    type,
    data.name || "",
    data.phone || "",
    data.email || "",
    address,
    memo,
    data.orderId || data.id || "",
    itemsText,
    totalText,
    data.page || ""
  ));

  var mailResult = sendAdminMail_("IRIS MAPPING LAB Shopping order", buildOrderBody_(data, itemsText, totalText, createdAt, memo, address));
  return json_({ ok: true, success: true, saved: true, sheet: ORDER_SHEET_NAME, emailSent: mailResult.sent, emailError: mailResult.error });
}

function appendInsuranceConsult_(data, type) {
  var sheet = getSheet_(INSURANCE_SHEET_NAME, headersInsurance_());
  sheet.appendRow(Array.of(
    new Date(),
    data.consultId || "",
    data.saveType || "",
    data.status || "",
    data.name || "",
    data.phone || "",
    data.gender || "",
    data.age || "",
    data.ageGroup || "",
    data.job || "",
    data.customerType || "",
    data.worryTarget || "",
    data.personalRiskConcern || "",
    data.currentInsurance || "",
    data.budget || "",
    data.recommendation || "",
    data.answersJson || "",
    data.createdAt || "",
    data.savedAt || "",
    data.page || ""
  ));

  var mailResult = sendAdminMail_("IRIS MAPPING LAB Insurance consult saved", buildInsuranceConsultBody_(data));
  return json_({ ok: true, success: true, saved: true, sheet: INSURANCE_SHEET_NAME, emailSent: mailResult.sent, emailError: mailResult.error });
}

function headersAlert_() {
  return "\uC800\uC7A5\uC77C\uC2DC,\uC811\uC218\uC77C\uC2DC,\uAD6C\uBD84,\uC774\uB984,\uC5F0\uB77D\uCC98,\uC774\uBA54\uC77C,\uC0C1\uB2F4 \uAC00\uB2A5 \uC2DC\uAC04,\uC8FC\uC18C,\uBB38\uC758\uB0B4\uC6A9,\uC8FC\uBB38\uBC88\uD638,\uC8FC\uBB38\uC0C1\uD488,\uCD1D\uAE08\uC561,\uD398\uC774\uC9C0".split(",");
}

function headersConsult_() {
  return "\uC800\uC7A5\uC77C\uC2DC,\uC811\uC218\uC77C\uC2DC,\uAD6C\uBD84,\uC774\uB984,\uC5F0\uB77D\uCC98,\uC774\uBA54\uC77C,\uC0C1\uB2F4 \uAC00\uB2A5 \uC2DC\uAC04,\uBB38\uC758\uB0B4\uC6A9,\uD398\uC774\uC9C0".split(",");
}

function headersOrder_() {
  return "\uC800\uC7A5\uC77C\uC2DC,\uC8FC\uBB38\uC77C\uC2DC,\uAD6C\uBD84,\uC774\uB984,\uC5F0\uB77D\uCC98,\uC774\uBA54\uC77C,\uC8FC\uC18C,\uBA54\uBAA8,\uC8FC\uBB38\uBC88\uD638,\uC8FC\uBB38\uC0C1\uD488,\uCD1D\uAE08\uC561,\uD398\uC774\uC9C0".split(",");
}

function headersInsurance_() {
  return "\uC800\uC7A5\uC77C\uC2DC,\uC0C1\uB2F4\uBC88\uD638,\uC800\uC7A5\uAD6C\uBD84,\uC0C1\uD0DC,\uC774\uB984,\uC804\uD654\uBC88\uD638,\uC131\uBCC4,\uB098\uC774,\uC5F0\uB839\uB300,\uC9C1\uC5C5\u00B7\uC5C5\uC885,\uACE0\uAC1D\uC720\uD615,\uAC71\uC815\uB300\uC0C1,\uC8FC\uC694\uAC71\uC815,\uD604\uC7AC\uBCF4\uD5D8,\uC608\uC0B0,\uC0C1\uB2F4\uBC29\uD5A5,\uC804\uCCB4\uB2F5\uBCC0JSON,\uC791\uC131\uC77C\uC2DC,\uC800\uC7A5\uC77C\uC2DC\uC6D0\uBCF8,\uD398\uC774\uC9C0".split(",");
}

function getSheet_(name, headers) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  ensureHeaders_(sheet, headers);
  return sheet;
}

function listReferralMembers_(referrer) {
  var referrerKey = normalizeReferralName_(referrer);
  var sheet = getSheet_(LEGACY_ALERT_SHEET_NAME, headersAlert_());
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1 || !referrerKey) return json_({ ok: true, success: true, members: [] });

  var headers = rows[0].map(function(value) { return String(value || "").trim(); });
  var membersByPhone = {};
  rows.slice(1).forEach(function(row) {
    var record = rowToObject_(headers, row);
    var type = String(record["\uAD6C\uBD84"] || "").trim();
    if (type !== "member" && type !== "member_login") return;
    var rowReferrer = extractReferrer_(record);
    if (normalizeReferralName_(rowReferrer) !== referrerKey) return;
    var phone = normalizePhone_(record["\uC5F0\uB77D\uCC98"]);
    if (!phone) return;
    membersByPhone[phone] = {
      memberPhone: phone,
      memberName: record["\uC774\uB984"] || "",
      memberEmail: record["\uC774\uBA54\uC77C"] || "",
      memberAddress: record["\uC8FC\uC18C"] || "",
      memberNo: "",
      joinedAt: record["\uC811\uC218\uC77C\uC2DC"] || "",
      referrer: rowReferrer,
      updatedAtText: record["\uC800\uC7A5\uC77C\uC2DC"] || "",
      source: "googleSheet"
    };
  });

  return json_({ ok: true, success: true, members: Object.keys(membersByPhone).map(function(phone) { return membersByPhone[phone]; }) });
}

function ensureHeaders_(sheet, headers) {
  var lastColumn = Math.max(sheet.getLastColumn(), 1);
  var current = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function(value) {
    return String(value || "").trim();
  });

  headers.forEach(function(header) {
    if (current.indexOf(header) !== -1) return;
    var insertIndex = current.length + 1;
    sheet.insertColumnBefore(insertIndex);
    sheet.getRange(1, insertIndex).setValue(header);
    current.splice(insertIndex - 1, 0, header);
  });
}

function rowToObject_(headers, row) {
  var record = {};
  headers.forEach(function(header, index) {
    record[header] = row[index];
  });
  return record;
}

function normalizePhone_(value) {
  var digits = String(value || "").replace(/\D/g, "");
  if (digits.indexOf("0082") === 0) digits = digits.slice(4);
  if (digits.indexOf("82") === 0) digits = digits.slice(2);
  if (digits.length === 10 && digits.indexOf("10") === 0) digits = "0" + digits;
  return digits;
}

function normalizeReferralName_(value) {
  return String(value || "").replace(/\s+/g, "").trim().toLowerCase();
}

function extractReferrer_(record) {
  var direct = record["\uCD94\uCC9C\uC778"] || record["\uC0C1\uB2F4 \uAC00\uB2A5 \uC2DC\uAC04"] || "";
  if (direct) return String(direct).replace(/^\s*\uCD94\uCC9C\uC778\s*:\s*/, "").trim();
  var memo = String(record["\uBB38\uC758\uB0B4\uC6A9"] || "");
  var match = memo.match(/\uCD94\uCC9C\uC778\s*:\s*([^,\n]+)/);
  return match ? match[1].trim() : "";
}

function sendAdminMail_(subject, body) {
  try {
    MailApp.sendEmail(ADMIN_EMAIL, subject, body);
    return { sent: true, error: "" };
  } catch (error) {
    return { sent: false, error: error && error.message ? error.message : String(error) };
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

function buildMemberSignupBody_(data) {
  return Array.of(
    "New member signup",
    "",
    "Member No: " + (data.memberNo || ""),
    "Name: " + (data.name || ""),
    "Phone: " + (data.phone || ""),
    "Phone Key: " + (data.phoneKey || ""),
    "Email: " + (data.email || ""),
    "Address: " + (data.address || ""),
    "Referrer: " + (data.referrer || ""),
    "Joined At: " + (data.joinedAt || data.createdAt || ""),
    "Page: " + (data.page || "")
  ).join("\n");
}

function buildConsultBody_(data, createdAt, memo) {
  return Array.of(
    "New consult request",
    "",
    "Name: " + (data.name || ""),
    "Phone: " + (data.phone || ""),
    "Email: " + (data.email || ""),
    "Message: " + memo,
    "Page: " + (data.page || ""),
    "Created At: " + createdAt
  ).join("\n");
}

function buildOrderBody_(data, itemsText, totalText, createdAt, memo, address) {
  return Array.of(
    "New shopping order",
    "",
    "Order ID: " + (data.orderId || data.id || ""),
    "Name: " + (data.name || ""),
    "Phone: " + (data.phone || ""),
    "Email: " + (data.email || ""),
    "Address: " + address,
    "Items:",
    itemsText || "No item data",
    "Total: " + totalText,
    "Memo: " + memo,
    "Page: " + (data.page || ""),
    "Created At: " + createdAt
  ).join("\n");
}

function buildInsuranceConsultBody_(data) {
  return Array.of(
    "Insurance consult saved",
    "",
    "Consult ID: " + (data.consultId || ""),
    "Save Type: " + (data.saveType || ""),
    "Status: " + (data.status || ""),
    "Name: " + (data.name || ""),
    "Phone: " + (data.phone || ""),
    "Gender/Age: " + (data.gender || "") + " / " + (data.age || ""),
    "Job: " + (data.job || ""),
    "Customer Type: " + (data.customerType || ""),
    "Concern: " + (data.personalRiskConcern || ""),
    "Current Insurance: " + (data.currentInsurance || ""),
    "Budget: " + (data.budget || ""),
    "Recommendation:",
    data.recommendation || "No recommendation",
    "Page: " + (data.page || "")
  ).join("\n");
}

function buildItemsText_(orderItems, data) {
  if (data && (data.orderItemsText || data.products || data.productSummary)) {
    return data.orderItemsText || data.products || data.productSummary;
  }
  if (!orderItems) return "";
  try {
    var items = typeof orderItems === "string" ? JSON.parse(orderItems) : orderItems;
    if (!Array.isArray(items)) return String(orderItems);
    return items.map(function(item) {
      var name = item.name || "No product name";
      var quantity = item.quantity || 1;
      var price = Number(item.salePrice || item.price || 0).toLocaleString("ko-KR") + "\uC6D0";
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
