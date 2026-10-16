# Kliktiva — Paket Publish V1.1 (Netlify + Apps Script + Google Sheets)

Paket ini menyiapkan satu frontend statis dan satu backend Google Apps Script. Database Google Sheets dibuat otomatis oleh fungsi `setupKliktiva()` saat dijalankan di akun Google Anda. Kami tidak memiliki akses untuk membuat spreadsheet di akun Google/Netlify Anda dari sesi ini, jadi langkah otorisasi dan deploy harus dilakukan dari akun Anda.

## Isi paket

- `site/index.html` — homepage Kliktiva V8 dengan demo Admin dan Public Preview tertanam (menjadi dokumen publik di Netlify).
- `netlify.toml` — konfigurasi publikasi Netlify.
- `netlify/functions/kliktiva-api.mjs` — proxy same-origin ke Apps Script. URL Web App disimpan pada environment variable Netlify, bukan di HTML.
- `apps-script/Code.gs` — backend Web App dan pembuat Google Sheets.
- `apps-script/appsscript.json` — manifest Apps Script.

## A. Buat Google Sheets Database

1. Login ke akun Google yang akan menjadi pemilik database.
2. Buka `https://script.google.com/home/start` dan buat project baru.
3. Hapus kode awal di editor, lalu salin seluruh isi `apps-script/Code.gs` ke file `Code.gs`.
4. Buka **Project Settings** dan aktifkan **Show `appsscript.json` manifest file in editor** jika perlu. Ganti manifest dengan isi file `apps-script/appsscript.json`.
5. Pilih fungsi `setupKliktiva` lalu klik **Run**. Berikan izin Google Sheets saat diminta.
6. Setelah berhasil, buka **Execution log**. Salin URL yang ditulis pada baris `DATABASE URL`. Satu spreadsheet dengan tab `Customers`, `Settings`, dan `Logs` sudah dibuat.
7. Buka tab `Settings` di spreadsheet itu dan isi kolom `Value` pada baris `AdminWhatsappNumber` dengan nomor WhatsApp Admin dalam format internasional, hanya angka. Contoh Indonesia: `6281234567890` (tanpa `+`, spasi, atau tanda strip). Jangan biarkan kosong jika form harus langsung membuka WhatsApp Admin.

### Struktur tab

**Customers** menyimpan ID konsultasi, Request ID, waktu, nama, nomor HP, aktivitas utama, kebutuhan, kanal tujuan, detail kebutuhan, ringkasan, sumber, dan status.

**Settings** mengelola nomor WhatsApp Admin dan beberapa pengaturan publik yang tidak sensitif.

**Logs** mencatat kejadian setup, penyimpanan berhasil, dan error secara ringkas—tidak mencatat ringkasan pribadi customer ke log.

Jangan bagikan spreadsheet ke publik. Pengunjung hanya dapat mengirim formulir melalui endpoint; API tidak menyediakan endpoint untuk membaca daftar customer.

## B. Deploy Google Apps Script sebagai Web App

1. Di Apps Script klik **Deploy → New deployment**.
2. Pilih jenis **Web app**.
3. **Execute as:** Me (akun pemilik script).
4. **Who has access:** Anyone, termasuk pengguna yang tidak login, karena formulir publik dipakai oleh calon pelanggan. Pastikan ini memang sesuai kebijakan data dan akun Anda.
5. Klik Deploy, berikan izin bila diminta, lalu salin URL Web App yang berakhiran `/exec`.
6. Uji URL tersebut dengan membuka `URL_WEB_APP/exec?action=health`. Respons yang benar memuat `"ok":true` dan `"databaseReady":true`.

Jika Anda mengubah kode Apps Script setelah deployment, buka **Deploy → Manage deployments → Edit**, pilih versi baru, lalu deploy/update. URL Web App biasanya tetap sama jika deployment yang sama diperbarui.

## C. Deploy frontend dan proxy ke Netlify

**Penting:** karena paket menggunakan Netlify Function, deploy proyek melalui Git (disarankan) atau Netlify CLI. Jangan hanya drag-and-drop `index.html` saja, karena fungsi serverless tidak ikut terpasang dalam static-only drag-and-drop.

### Cara melalui GitHub (disarankan)

1. Buat repository GitHub baru/private dan unggah seluruh isi folder paket ini, termasuk `netlify.toml` dan folder `netlify/functions/`.
2. Di Netlify pilih **Add new site → Import an existing project**, lalu hubungkan repository tersebut.
3. Build command dapat dikosongkan; publish directory adalah `site`. `netlify.toml` sudah menetapkannya.
4. Buka **Site configuration → Environment variables** (nama menu dapat berubah), lalu tambahkan:
   - **Key:** `KLIKTIVA_APPS_SCRIPT_URL`
   - **Value:** URL Web App Apps Script yang berakhiran `/exec`.
   - **Scope:** pastikan mencakup Functions/runtime.
5. Trigger deploy baru setelah environment variable ditambahkan/diubah. Netlify membaca environment variable fungsi pada deployment, dan perubahan variabel baru berlaku setelah redeploy.
6. Buka website Netlify dan uji `https://DOMAIN-NETLIFY-ANDA/.netlify/functions/kliktiva-api?action=health`. Respons yang benar memuat `"ok":true` dan `"databaseReady":true`.
7. Uji `https://DOMAIN-NETLIFY-ANDA/.netlify/functions/kliktiva-api?action=config`. Pastikan `adminWhatsappNumber` berisi nomor yang Anda masukkan pada tab `Settings`.

Dokumentasi resmi Netlify menyatakan environment variable dapat diakses oleh Netlify Functions lewat `process.env`; variabel harus memiliki scope Functions dan perlu redeploy agar perubahan berlaku: https://docs.netlify.com/build/functions/environment-variables/.

## D. Tes alur konsultasi

1. Buka homepage yang telah dipublikasikan melalui domain Netlify, bukan file HTML lokal.
2. Isi semua kolom formulir dan klik tombol kirim.
3. Tunggu konfirmasi penyimpanan, lalu WhatsApp akan terbuka dengan ringkasan dan ID konsultasi, asalkan nomor Admin tersedia di `Settings`.
4. Pastikan baris baru muncul di tab `Customers`.
5. WhatsApp menyiapkan pesan; pengguna tetap harus menekan **Kirim** di aplikasi WhatsApp agar pesan benar-benar dikirim.

Jika backend belum dikonfigurasi, respons akan menampilkan kesalahan yang jelas dan WhatsApp tidak dibuka. Hal ini disengaja agar permintaan tidak diklaim tersimpan padahal belum.

## Catatan keamanan dan operasional

- URL Apps Script disimpan di environment variable Netlify Function, tidak dibuka di HTML.
- Nomor WhatsApp Admin diambil dari tab `Settings` melalui endpoint konfigurasi publik.
- Data customer tidak pernah dikirim kembali oleh API untuk operasi baca/list; endpoint publik hanya menerima submit.
- Honeypot sederhana dan validasi server mengurangi kiriman bot sederhana, tetapi tidak setara dengan CAPTCHA/WAF. Jika trafik spam meningkat, tambahkan rate limiting atau CAPTCHA.
- Spreadsheet dibuat di akun Google Anda setelah `setupKliktiva()` dijalankan. Tidak ada data customer contoh yang dimasukkan.
- Form meminta data kontak pribadi. Sebelum live, pastikan privacy notice, retensi data, dan akses spreadsheet sesuai kebutuhan operasional Anda.


## Perbaikan V1.1 untuk submit formulir
- Kolom detail tambahan sekarang opsional di backend, konsisten dengan UI form (kolom nama, HP, aktivitas, dan kebutuhan utama tetap wajib).
- Honeypot frontend memakai nama teknis acak dan `autocomplete=new-password` agar lebih kecil kemungkinan terisi otomatis oleh browser. Payload API tetap menyertakan field `website` yang diperlukan backend.
- Kesalahan validasi pengguna dikembalikan dengan kode `VALIDATION_ERROR` dan pesan yang bisa diperbaiki; kegagalan penyimpanan tetap menampilkan pesan umum yang tidak membocorkan detail internal.

### Update dari V1.0
1. Perbarui isi `apps-script/Code.gs` di editor Apps Script dengan file pada paket V1.1. Pilih **Deploy → Manage deployments → Edit → New version → Deploy**. URL `/exec` biasanya tetap sama saat deployment yang sama diperbarui.
2. Ganti `site/index.html` di repository GitHub dengan versi V1.1, commit/push, lalu tunggu Netlify melakukan deploy. Jangan menghapus `netlify.toml` atau `netlify/functions/kliktiva-api.mjs`.
3. Environment variable `KLIKTIVA_APPS_SCRIPT_URL` biasanya tidak perlu diubah jika URL `/exec` tetap sama.
4. Tes ulang formulir. Detail tambahan boleh kosong, sedangkan Nama, Nomor HP, Aktivitas Utama, dan Kebutuhan harus diisi. Periksa tab `Customers` dan `Logs` jika terjadi kegagalan.


## Patch V1.2 — Perbaikan Live Public Preview
Paket ini mencakup perbaikan handshake `postMessage` untuk preview bersarang. Jika memperbarui site yang sudah online, ganti `site/index.html` di repository GitHub menggunakan file pada paket ini, lalu commit/push agar Netlify melakukan deploy. Tidak perlu deploy ulang Apps Script atau mengubah Google Sheets. Detail ada di `PATCH_NOTES_v1.2.md`.
