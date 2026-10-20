KLIKTIVA WEBSITE (MARKETING) — PAKET CLOUDFLARE WORKER v1.6

PERUBAHAN v1.6 (persyaratan Midtrans)
- Halaman baru: /syarat-ketentuan dan /kebijakan-pengembalian (file site/syarat-ketentuan.html dan site/kebijakan-pengembalian.html).
- Nomor Kliktiva +62 856-0270-3111 tampil jelas (statis) di section Kontak, footer, dan kedua halaman legal.
- Tautan Syarat & Ketentuan, Kebijakan Pengembalian Dana, dan Kebijakan Privasi di footer dan di bawah Harga.
- Nomor bawaan WhatsApp = 6285602703111. Bila AdminWhatsappNumber di sheet Settings diisi, nilai sheet menimpa tombol WhatsApp
  di halaman utama; isi sheet dengan 6285602703111 (atau kosongkan) supaya konsisten.
- Email & alamat usaha diatur di sheet Settings: ContactEmail dan BusinessAddress (Apps Script v1.3.0).
  Tampil di footer, section Kontak, dan kedua halaman legal hanya bila diisi; kosong = tersembunyi.
  Setelah Code.gs diperbarui, jalankan setupKliktiva sekali (baris baru dibuat otomatis) lalu Deploy > Manage deployments > Edit > New version.


YANG BERUBAH DARI v1.4 (menyesuaikan kliktiva-core: daftar mandiri di app.kliktiva.my.id)
- Tombol "Daftar Sekarang" (ke https://app.kliktiva.my.id/) di header, hero, Template, Layanan, Proses, Harga, CTA.
  "Konsultasi gratis" tetap ada sebagai tombol kedua; formulir kini untuk Paket Personal.
- Harga 4 paket: Free Rp0/30 hari, Bulanan Rp25.000, Tahunan Rp250.000 (hemat Rp50.000), Personal nego Admin.
  Harga ditulis langsung di site/index.html (bagian <!-- HARGA -->). Paket di sistem diatur dari panel app.
- Section baru "Template" (menu di kanan Demo): galeri template per kategori.
- Demo Admin memakai Web Admin kliktiva-core, dengan saklar Paket Free / Paket Berbayar.
- Proses baru: Cek Demo > Daftar > Pilih Paket Gratis > Website Live > Tumbuh Bersama.
- FAQ: cara daftar, beda Free vs berbayar, cara bayar, masa aktif habis.
- Footer: Masuk/Daftar dan Kebijakan Privasi (app.kliktiva.my.id/privasi).
- Angka free trial tidak lagi diambil dari FreeTrialDays (sheet Settings); tertulis 30 hari di HTML.
- src/index.js, wrangler.jsonc, dan apps-script/Code.gs TIDAK berubah dari v1.4.

LANGKAH DEPLOY (repo GitHub yang sama dengan v1.3)
1. Apps Script formulir konsultasi (lewati bila v1.4 sudah dipasang; Code.gs sama):
   a. Ganti isi Code.gs dengan apps-script/Code.gs (versi 1.2.0), simpan.
   b. Jalankan setupKliktiva() satu kali -> baris Social_* ditambahkan ke sheet Settings.
   c. Deploy > Manage deployments > Edit > Version: New version > Deploy. URL /exec tetap sama,
      jadi variabel KLIKTIVA_APPS_SCRIPT_URL di Cloudflare tidak perlu diubah.
   d. Di sheet Settings: ubah FreeTrialDays menjadi 14, isi Social_* (URL https://) dan Social_*_Name.
2. GitHub: buka repo website (kliktiva-web), unggah ISI folder ini ke root repo, timpa file lama.
   Pastikan folder site/assets dan site/demo-admin ikut terunggah.
   (GitHub web: Add file > Upload files > seret semua isi folder > Commit changes.)
3. Cloudflare otomatis build & deploy dari commit tersebut (Workers & Pages > kliktiva-web > Deployments).
4. Uji setelah deploy:
   https://kliktiva.my.id/                      -> halaman baru tampil
   https://kliktiva.my.id/api/kliktiva?action=config -> JSON berisi adminWhatsappNumber, freeTrialDays, socials
   Tab Demo Admin Desktop / Mobile / Galeri Template berjalan; kirim satu formulir konsultasi percobaan.
   Jika tampilan lama masih muncul, muat ulang dengan Ctrl+F5.

PEMERIKSAAN LOKAL (opsional)
  npm run check:all
