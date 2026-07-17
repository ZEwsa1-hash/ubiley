const SHEET_NAME = 'Ответы';
const HEADERS = [
  'Дата и время ответа',
  'ФИО',
  'Присутствие',
  'Алкоголь',
  'Свой вариант',
  'Дети',
  'Количество детей',
];

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const data = validatePayload(payload);
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
    const lock = LockService.getScriptLock();

    lock.waitLock(10000);
    try {
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(HEADERS);
        sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
        sheet.setFrozenRows(1);
      }

      sheet.appendRow([
        new Date(),
        safeCell(data.fullName),
        data.attendance === 'yes' ? 'Буду' : 'Не смогу присутствовать',
        safeCell(data.alcohol.join(', ')),
        safeCell(data.alcoholOther),
        data.hasChildren ? 'Да' : 'Нет',
        data.childrenCount,
      ]);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message || 'Некорректные данные' });
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: 'Karina 35 RSVP' });
}

function validatePayload(payload) {
  const fullName = String(payload.fullName || '').trim();
  const attendance = payload.attendance;
  const alcohol = Array.isArray(payload.alcohol) ? payload.alcohol.map(String) : [];
  const alcoholOther = String(payload.alcoholOther || '').trim();
  const hasChildren = payload.hasChildren === true;
  const childrenCount = Number(payload.childrenCount || 0);
  const allowedAlcohol = ['Игристое', 'Белое вино', 'Красное вино', 'Крепкий алкоголь', 'Без алкоголя', 'Другое'];

  if (fullName.length < 2 || fullName.length > 160) throw new Error('Укажите ФИО');
  if (!['yes', 'no'].includes(attendance)) throw new Error('Некорректный статус участия');
  if (attendance === 'yes' && alcohol.length === 0) throw new Error('Выберите алкоголь');
  if (alcohol.some((item) => !allowedAlcohol.includes(item))) throw new Error('Некорректный вариант алкоголя');
  if (alcohol.includes('Другое') && !alcoholOther) throw new Error('Уточните свой вариант');
  if (!Number.isInteger(childrenCount) || childrenCount < 0 || childrenCount > 10) throw new Error('Некорректное количество детей');
  if (hasChildren && childrenCount < 1) throw new Error('Укажите количество детей');

  return {
    fullName,
    attendance,
    alcohol: attendance === 'yes' ? alcohol : [],
    alcoholOther: attendance === 'yes' ? alcoholOther : '',
    hasChildren: attendance === 'yes' && hasChildren,
    childrenCount: attendance === 'yes' && hasChildren ? childrenCount : 0,
  };
}

function safeCell(value) {
  const stringValue = String(value || '');
  return /^[=+\-@]/.test(stringValue) ? "'" + stringValue : stringValue;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
