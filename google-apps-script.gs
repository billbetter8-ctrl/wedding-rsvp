const SHEET_NAME = "Ответы";

/**
 * Google Apps Script.
 * 1. Создайте Google Таблицу.
 * 2. Расширения → Apps Script.
 * 3. Вставьте этот код.
 * 4. Замените SPREADSHEET_ID на ID вашей таблицы.
 * 5. Deploy → New deployment → Web app.
 *    Execute as: Me
 *    Who has access: Anyone
 */
const SPREADSHEET_ID = "PASTE_SPREADSHEET_ID_HERE";

function doGet() {
  return json({ ok: true, service: "wedding-rsvp" });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const sheet = getSheet();

    sheet.appendRow([
      new Date(),
      data.guestId || "",
      data.attendance || "",
      data.guests || "",
      data.guestsOther || "",
      data.alcohol || "",
      data.wine || "",
      data.spirits || "",
      data.beer || "",
      data.otherAlcohol || "",
      data.drinks || "",
      data.comment || ""
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Дата",
      "Guest ID",
      "Придёт",
      "Гости",
      "Другой вариант",
      "Алкоголь",
      "Вино, л",
      "Крепкое, л",
      "Пиво, л",
      "Другое, л",
      "Что будет пить",
      "Комментарий"
    ]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function json(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
