const SHEET_NAME = 'Ответы гостей';
const SPREADSHEET_ID = '1Kfx4NxM6L7SpjRPVchEbQ_nj9hwz2M7betX1fswHspY';
const HEADERS = [
  'Дата отправки',
  'ФИО',
  'Присутствие',
  'Алкоголь',
  'Будут ли дети',
  'Количество детей',
  'Страница',
  'Устройство'
];

function doGet() {
  return jsonResponse({ success: true, message: 'Сервис приёма ответов работает.' });
}

function doPost(e) {
  const lock = LockService.getDocumentLock();

  try {
    const rawBody = e && e.postData ? e.postData.contents : '{}';
    const data = JSON.parse(rawBody || '{}');
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    lock.waitLock(10000);

    if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const submittedAt = data.submittedAt ? new Date(data.submittedAt) : new Date();
    const validSubmittedAt = Number.isNaN(submittedAt.getTime()) ? new Date() : submittedAt;
    const row = [
      validSubmittedAt,
      safeCell(data.fullName),
      safeCell(data.attendance),
      safeCell(data.alcohol),
      safeCell(data.children),
      safeCell(data.childrenCount || '0'),
      safeCell(data.pageUrl),
      safeCell(data.userAgent)
    ];

    sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setValues([row]);
    sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1)
      .setNumberFormat('dd.MM.yyyy HH:mm:ss');

    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({ success: false, error: String(error) });
  } finally {
    try {
      lock.releaseLock();
    } catch (error) {
      // Lock was not acquired; nothing to release.
    }
  }
}

function safeCell(value) {
  const text = value == null ? '' : String(value).trim();
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
