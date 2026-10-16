# Kliktiva Production Package V1.1 — Fix formulir konsultasi

## Perbaikan
1. Detail kebutuhan tambahan (`Apa yang ingin ditampilkan?`) sekarang opsional sesuai tampilan form; aktivitas dan kategori kebutuhan tetap wajib.
2. Nama field honeypot HTML tidak lagi `website`, agar tidak mudah terisi otomatis oleh browser/extension. Apps Script masih menerima property `website` yang dikirim dari frontend.
3. Respons validasi yang dapat diperbaiki pengguna (`Nama`, `Nomor HP`, `Aktivitas Utama`, `Kebutuhan`) dikembalikan dengan kode `VALIDATION_ERROR` dan pesan spesifik. Kegagalan penyimpanan tetap memakai pesan generik agar detail internal tidak dibocorkan.

## Yang harus diperbarui
- Commit/deploy ulang seluruh package ke Netlify.
- Di Apps Script, perbarui `Code.gs` dari folder `apps-script`, lalu Deploy > Manage deployments > Edit > pilih New version > Deploy. URL `/exec` biasanya tetap sama bila deployment yang sama diedit.
- Pastikan environment variable Netlify `KLIKTIVA_APPS_SCRIPT_URL` masih menunjuk ke URL `/exec` tersebut, lalu redeploy Netlify.

## Pemeriksaan setelah deploy
1. Buka `/.netlify/functions/kliktiva-api?action=health` dan pastikan `ok=true`, `databaseReady=true`.
2. Isi formulir menggunakan data tes. Kolom detail tambahan boleh kosong, tetapi nama, nomor HP, aktivitas utama, dan kebutuhan harus valid.
3. Pastikan ada baris baru pada tab `Customers`, dan pesan WhatsApp disiapkan ke nomor dari tab `Settings`.
4. Jika gagal, buka tab `Logs` dan catat baris terakhir `CUSTOMER_SAVE_FAILED`; jangan membagikan data pribadi pelanggan dari spreadsheet.
