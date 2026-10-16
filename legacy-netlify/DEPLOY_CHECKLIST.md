# Checklist sebelum live

- [ ] `setupKliktiva()` selesai dan Google Sheets Database Customer dibuat.
- [ ] Tab `Settings` → `AdminWhatsappNumber` diisi format 62xxxxxxxxxx.
- [ ] Apps Script Web App dideploy dengan Execute as Me dan akses publik yang sesuai.
- [ ] URL Web App diuji melalui `?action=health` dan `databaseReady=true`.
- [ ] Repository Netlify berisi `index.html`, `netlify.toml`, dan `netlify/functions/kliktiva-api.mjs`.
- [ ] Environment variable `KLIKTIVA_APPS_SCRIPT_URL` diatur untuk scope Functions.
- [ ] Site Netlify di-redeploy setelah pengaturan environment variable.
- [ ] Endpoint Netlify `/.netlify/functions/kliktiva-api?action=health` berhasil.
- [ ] Endpoint Netlify `/.netlify/functions/kliktiva-api?action=config` menampilkan nomor admin yang benar.
- [ ] Tes konsultasi menambahkan satu baris pada tab `Customers`.
- [ ] WhatsApp terbuka dengan teks dan ID konsultasi yang benar.
- [ ] Tes gagal (misalnya matikan environment variable pada Deploy Preview) tidak membuka WhatsApp.
- [ ] Link privacy notice, akses spreadsheet, backup, dan kebijakan retensi data ditinjau.

## V1.1 form-fix retest
- [ ] Apps Script deployed with `VERSION: 1.1.0`
- [ ] Netlify site updated from V1.1 `site/index.html` and function remains deployed
- [ ] `action=health` and `action=config` still succeed
- [ ] Valid consultation creates a row in `Customers`
- [ ] `Logs` is checked if saving fails
- [ ] WhatsApp opens using configured `AdminWhatsappNumber`

- [ ] Demo Admin: Public Preview menampilkan Ruang Rona, foto profil, empat koleksi, dan Lavender Mist sejak pertama dibuka.
- [ ] Ubah nama/motto atau palet pada Admin dan pastikan Public Preview langsung berubah.
