/**
 * Backend for the "Who We Build Warmy For" team page.
 * Stores personas, journey-map cells and team ideas in the sheet "data".
 * Deploy: Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone.
 */
const COLLECTIONS = ['personas', 'cells', 'ideas'];
const MAX_DOC_CHARS = 40000;

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('data');
  if (!sh) {
    sh = ss.insertSheet('data');
    sh.appendRow(['collection', 'id', 'json', 'updatedAt']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function rows_() {
  return sheet_().getDataRange().getValues();
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const v = rows_();
  const data = { personas: {}, cells: {}, ideas: {} };
  for (let i = 1; i < v.length; i++) {
    const c = v[i][0], id = v[i][1];
    if (!data[c] || !id) continue;
    try { data[c][id] = JSON.parse(v[i][2]); } catch (e) {}
  }
  return json_({ ok: true, data: data });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const b = JSON.parse(e.postData.contents);
    const sh = sheet_();
    const v = sh.getDataRange().getValues();
    const now = new Date().toISOString();

    if (b.op === 'seed') {
      if (v.length > 1) return json_({ ok: true, skipped: true });
      const rows = (b.docs || [])
        .filter(function (d) { return COLLECTIONS.indexOf(d.c) >= 0 && d.id; })
        .map(function (d) { return [d.c, String(d.id), JSON.stringify(d.data || {}), now]; });
      if (rows.length) sh.getRange(2, 1, rows.length, 4).setValues(rows);
      return json_({ ok: true });
    }

    if (COLLECTIONS.indexOf(b.c) < 0 || !b.id || String(b.id).length > 200) return json_({ ok: false, code: 'invalid' });

    let row = 0;
    for (let i = 1; i < v.length; i++) if (v[i][0] === b.c && String(v[i][1]) === String(b.id)) { row = i + 1; break; }

    if (b.op === 'delete') {
      if (row) sh.deleteRow(row);
      return json_({ ok: true });
    }

    let current = {};
    if (row) { try { current = JSON.parse(v[row - 1][2]); } catch (err) {} }
    const next = b.op === 'update' ? Object.assign(current, b.data || {}) : (b.data || {});
    const text = JSON.stringify(next);
    if (text.length > MAX_DOC_CHARS) return json_({ ok: false, code: 'invalid' });

    if (row) sh.getRange(row, 3, 1, 2).setValues([[text, now]]);
    else sh.appendRow([b.c, String(b.id), text, now]);
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}
