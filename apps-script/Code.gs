/**
 * Kliktiva - Customer Consultation API
 * Google Apps Script Web App + Google Sheets database.
 * Deploy as: Execute as Me, Who has access: Anyone.
 * Public API is write-only for customer submissions; customer records are never returned.
 */
const KL_SETTINGS = {
  DB_PROPERTY: 'KLIKTIVA_DATABASE_SPREADSHEET_ID',
  VERSION: '1.1.0',
  CUSTOMER_SHEET: 'Customers',
  SETTINGS_SHEET: 'Settings',
  LOGS_SHEET: 'Logs'
};

const CUSTOMER_HEADERS = [
  'CustomerID', 'RequestID', 'SubmittedAt', 'Nama', 'NomorHP',
  'AktivitasUtama', 'Kebutuhan', 'KanalTujuan', 'DetailKebutuhan',
  'Ringkasan', 'Sumber', 'Status'
];
const SETTINGS_HEADERS = ['Key', 'Value', 'UpdatedAt', 'Description'];
const LOG_HEADERS = ['Timestamp', 'Level', 'Action', 'RequestID', 'CustomerID', 'Detail'];

/** Run once from Apps Script editor. Creates the one Google Sheets database. */
function setupKliktiva() {
  const props = PropertiesService.getScriptProperties();
  let spreadsheetId = props.getProperty(KL_SETTINGS.DB_PROPERTY);
  let ss;
  if (spreadsheetId) {
    try { ss = SpreadsheetApp.openById(spreadsheetId); }
    catch (e) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create('Database Customer Kliktiva');
    spreadsheetId = ss.getId();
    props.setProperty(KL_SETTINGS.DB_PROPERTY, spreadsheetId);
  }

  const customers = getOrCreateSheet_(ss, KL_SETTINGS.CUSTOMER_SHEET, CUSTOMER_HEADERS);
  const settings = getOrCreateSheet_(ss, KL_SETTINGS.SETTINGS_SHEET, SETTINGS_HEADERS);
  const logs = getOrCreateSheet_(ss, KL_SETTINGS.LOGS_SHEET, LOG_HEADERS);

  // All customer-supplied fields are treated as text; formula-like input is escaped again at write time.
  customers.setFrozenRows(1);
  customers.getRange(1, 1, customers.getMaxRows(), CUSTOMER_HEADERS.length).setNumberFormat('@');
  customers.getRange(1, 3, customers.getMaxRows(), 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  customers.setColumnWidth(1, 135); customers.setColumnWidth(2, 220); customers.setColumnWidth(3, 165);
  customers.setColumnWidth(4, 190); customers.setColumnWidth(5, 150); customers.setColumnWidth(6, 150);
  customers.setColumnWidth(7, 190); customers.setColumnWidth(8, 240); customers.setColumnWidth(9, 360);
  customers.setColumnWidth(10, 420); customers.setColumnWidth(11, 180); customers.setColumnWidth(12, 120);

  settings.setFrozenRows(1); settings.setColumnWidth(1, 240); settings.setColumnWidth(2, 300); settings.setColumnWidth(3, 170); settings.setColumnWidth(4, 480);
  ensureSetting_(settings, 'AdminWhatsappNumber', '', 'Nomor WhatsApp Admin format internasional, hanya angka. Contoh Indonesia: 6281234567890. Jangan gunakan tanda +, spasi, atau strip.');
  ensureSetting_(settings, 'BrandName', 'Kliktiva', 'Nama brand yang digunakan pada respons publik.');
  ensureSetting_(settings, 'FreeTrialDays', '7', 'Durasi free trial untuk kebutuhan informasi pemasaran.');
  ensureSetting_(settings, 'PrivacyNotice', 'Data digunakan untuk menindaklanjuti permintaan konsultasi landing page Kliktiva.', 'Keterangan penggunaan data konsultasi.');

  logs.setFrozenRows(1); logs.setColumnWidth(1, 170); logs.setColumnWidth(2, 100); logs.setColumnWidth(3, 180);
  logs.setColumnWidth(4, 240); logs.setColumnWidth(5, 150); logs.setColumnWidth(6, 450);
  logEvent_('INFO', 'SETUP', '', '', 'Database siap: ' + ss.getId());

  const result = {
    ok: true,
    message: 'Database Customer Kliktiva berhasil disiapkan.',
    spreadsheetName: ss.getName(),
    spreadsheetUrl: ss.getUrl(),
    spreadsheetId: ss.getId(),
    sheets: [KL_SETTINGS.CUSTOMER_SHEET, KL_SETTINGS.SETTINGS_SHEET, KL_SETTINGS.LOGS_SHEET]
  };
  Logger.log('DATABASE URL: ' + ss.getUrl());
  Logger.log(JSON.stringify(result));
  return result;
}

/** Public health/config endpoint. Does not return the database URL or customer records. */
function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || 'config').toLowerCase();
  if (action === 'health') {
    let ready = false;
    try {
      const ss = getDatabase_();
      ready = Boolean(ss.getSheetByName(KL_SETTINGS.CUSTOMER_SHEET) && ss.getSheetByName(KL_SETTINGS.SETTINGS_SHEET));
    } catch (err) { ready = false; }
    return jsonOutput_({ ok: true, service: 'Kliktiva Consultation API', version: KL_SETTINGS.VERSION, databaseReady: ready, timestamp: new Date().toISOString() });
  }
  if (action !== 'config') return jsonOutput_({ ok: false, error: 'ACTION_NOT_FOUND', message: 'Aksi tidak tersedia.' });
  try {
    const ss = getDatabase_();
    const settings = getSettingsMap_(ss.getSheetByName(KL_SETTINGS.SETTINGS_SHEET));
    return jsonOutput_({
      ok: true,
      config: {
        brandName: settings.BrandName || 'Kliktiva',
        adminWhatsappNumber: normalizeWhatsapp_(settings.AdminWhatsappNumber || ''),
        freeTrialDays: Number(settings.FreeTrialDays || 7),
        privacyNotice: settings.PrivacyNotice || ''
      }
    });
  } catch (err) {
    // Public config endpoint remains non-sensitive; setup details stay in the script editor logs.
    return jsonOutput_({ ok: true, configured: false, config: { brandName: 'Kliktiva', adminWhatsappNumber: '', freeTrialDays: 7 } });
  }
}

/** Public write-only endpoint for the contact/consultation form. */
function doPost(e) {
  let requestId = '';
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    if (raw.length > 30000) return jsonOutput_({ ok: false, error: 'PAYLOAD_TOO_LARGE', message: 'Data formulir terlalu besar.' });
    const payload = JSON.parse(raw);
    requestId = cleanText_(payload.requestId, 100) || Utilities.getUuid();

    // Honeypot for low-effort bot submissions. Do not store the record or open WhatsApp.
    if (cleanText_(payload.website, 200)) {
      return jsonOutput_({ ok: false, error: 'INVALID_SUBMISSION', message: 'Formulir tidak dapat diproses. Silakan muat ulang halaman.' });
    }

    const data = validatePayload_(payload);
    const cache = CacheService.getScriptCache();
    const cacheKey = 'request_' + requestId.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80);
    const prior = cache.get(cacheKey);
    if (prior) return jsonOutput_(JSON.parse(prior));

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const cachedInsideLock = cache.get(cacheKey);
      if (cachedInsideLock) return jsonOutput_(JSON.parse(cachedInsideLock));
      const ss = getDatabase_();
      const sheet = ss.getSheetByName(KL_SETTINGS.CUSTOMER_SHEET);
      if (!sheet) throw new Error('CUSTOMER_SHEET_NOT_FOUND');
      const nextNumber = Math.max(1, sheet.getLastRow()); // row 1 is the header
      const customerId = 'KLT-' + String(nextNumber).padStart(6, '0');
      const submittedAt = new Date();
      const channels = data.channels.join(', ');
      const row = [
        customerId,
        requestId,
        submittedAt,
        safeCell_(data.name),
        safeCell_(data.phone),
        safeCell_(data.activity),
        safeCell_(data.needType),
        safeCell_(channels),
        safeCell_(data.description),
        safeCell_(data.summary),
        safeCell_(data.source),
        'NEW'
      ];
      sheet.appendRow(row);

      const settings = getSettingsMap_(ss.getSheetByName(KL_SETTINGS.SETTINGS_SHEET));
      const adminWhatsappNumber = normalizeWhatsapp_(settings.AdminWhatsappNumber || '');
      const response = {
        ok: true,
        success: true,
        customerId: customerId,
        message: 'Data konsultasi berhasil disimpan.',
        adminWhatsappNumber: adminWhatsappNumber,
        whatsappReady: Boolean(adminWhatsappNumber),
        savedAt: submittedAt.toISOString()
      };
      cache.put(cacheKey, JSON.stringify(response), 21600);
      logEvent_('INFO', 'CUSTOMER_SAVED', requestId, customerId, 'Consultation received');
      return jsonOutput_(response);
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    const errorDetail = String(err && err.message ? err.message : err).slice(0, 300);
    logEvent_('ERROR', 'CUSTOMER_SAVE_FAILED', requestId, '', errorDetail);
    const publicValidationMessages = [
      'Nama wajib diisi minimal 2 karakter.',
      'Nomor HP tidak valid.',
      'Aktivitas utama wajib dipilih.',
      'Kebutuhan wajib dipilih.'
    ];
    if (publicValidationMessages.includes(errorDetail)) {
      return jsonOutput_({ ok: false, success: false, error: 'VALIDATION_ERROR', message: errorDetail });
    }
    return jsonOutput_({ ok: false, success: false, error: 'SAVE_FAILED', message: 'Data belum berhasil disimpan. Silakan coba lagi beberapa saat.' });
  }
}

function validatePayload_(p) {
  const name = cleanText_(p.name, 100);
  const phone = cleanText_(p.phone, 30);
  const activity = cleanText_(p.activity, 120);
  const needType = cleanText_(p.needType, 160);
  const description = cleanText_(p.description, 5000);
  const summary = cleanText_(p.summary, 10000);
  const source = cleanText_(p.source, 120) || 'Kliktiva Homepage';
  const channels = Array.isArray(p.channels) ? p.channels.slice(0, 30).map(v => cleanText_(v, 100)).filter(Boolean) : [];
  if (name.length < 2) throw new Error('Nama wajib diisi minimal 2 karakter.');
  if (phone.replace(/\D/g, '').length < 8 || phone.replace(/\D/g, '').length > 15) throw new Error('Nomor HP tidak valid.');
  if (!activity) throw new Error('Aktivitas utama wajib dipilih.');
  if (!needType) throw new Error('Kebutuhan wajib dipilih.');
  // Detail tambahan bersifat opsional di frontend; aktivitas dan kebutuhan utama tetap wajib.
  return { name, phone, activity, needType, channels, description, summary, source };
}

function getDatabase_() {
  const id = PropertiesService.getScriptProperties().getProperty(KL_SETTINGS.DB_PROPERTY);
  if (!id) throw new Error('DATABASE_NOT_INITIALIZED: jalankan setupKliktiva() dari Apps Script editor terlebih dahulu.');
  return SpreadsheetApp.openById(id);
}

function getOrCreateSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    if (name === KL_SETTINGS.CUSTOMER_SHEET && ss.getSheets().length === 1 && ss.getSheets()[0].getLastRow() === 0) {
      sheet = ss.getSheets()[0]; sheet.setName(name);
    } else sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  else {
    const current = sheet.getRange(1, 1, 1, Math.max(headers.length, sheet.getLastColumn())).getDisplayValues()[0];
    if (headers.some((h, i) => current[i] !== h)) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#EDE5FF').setFontColor('#20134A');
  return sheet;
}

function ensureSetting_(sheet, key, defaultValue, description) {
  const last = sheet.getLastRow();
  if (last > 1) {
    const keys = sheet.getRange(2, 1, last - 1, 1).getDisplayValues().flat();
    if (keys.includes(key)) return;
  }
  sheet.appendRow([key, defaultValue, new Date(), description]);
}

function getSettingsMap_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return {};
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getDisplayValues();
  const map = {};
  rows.forEach(r => { if (r[0]) map[String(r[0]).trim()] = String(r[1] || '').trim(); });
  return map;
}

function normalizeWhatsapp_(value) {
  let n = String(value || '').replace(/\D/g, '');
  if (n.startsWith('0')) n = '62' + n.slice(1);
  return /^\d{8,15}$/.test(n) ? n : '';
}

function cleanText_(value, maxLength) {
  return String(value == null ? '' : value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, maxLength || 1000);
}

function safeCell_(value) {
  const s = String(value == null ? '' : value);
  // Prevent user text from being interpreted as a spreadsheet formula.
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function logEvent_(level, action, requestId, customerId, detail) {
  try {
    const ss = getDatabase_();
    let sheet = ss.getSheetByName(KL_SETTINGS.LOGS_SHEET);
    if (!sheet) sheet = getOrCreateSheet_(ss, KL_SETTINGS.LOGS_SHEET, LOG_HEADERS);
    sheet.appendRow([new Date(), level, action, safeCell_(requestId || ''), safeCell_(customerId || ''), safeCell_(detail || '')]);
  } catch (e) {
    // Logging must never prevent a valid customer submission.
    console.error('Kliktiva log failure: ' + e);
  }
}

function jsonOutput_(object) {
  return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON);
}
