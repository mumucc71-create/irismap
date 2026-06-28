const ADMIN_EMAIL = "mumu5499@hanmail.net";
const SHEET_NAME = "상담요청";

function doPost(e) {
  const data = e && e.parameter ? e.parameter : {};
  const sheet = getConsultSheet_();
  const createdAt = data.createdAt || new Date().toISOString();
  const row = [
    new Date(),
    createdAt,
    data.source || "shopping",
    data.name || "",
    data.phone || "",
    data.availableTime || "",
    data.page || ""
  ];
  sheet.appendRow(row);

  const subject = "[IRIS MAPPING LAB] 쇼핑 상담요청";
  const body = [
    "쇼핑 상담요청이 접수되었습니다.",
    "",
    "이름: " + (data.name || ""),
    "연락처: " + (data.phone || ""),
    "상담 가능 시간: " + (data.availableTime || ""),
    "접수 출처: " + (data.source || "shopping"),
    "페이지: " + (data.page || ""),
    "접수일시: " + createdAt
  ].join("\n");
  MailApp.sendEmail(ADMIN_EMAIL, subject, body);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getConsultSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["저장일시", "접수일시", "출처", "이름", "연락처", "상담 가능 시간", "페이지"]);
  }
  return sheet;
}
