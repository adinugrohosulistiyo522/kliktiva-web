KLIKTIVA WEBSITE (MARKETING) — PAKET CLOUDFLARE WORKER v1.4

YANG BERUBAH DARI v1.3
- Konten website baru (posisi "website katalog atas nama brand-mu", 9 jenis bisnis, filosofi, fitur, Analytics, FAQ, proses).
- Demo Admin memakai Web Admin terbaru (User1 PreRelease) dengan backend palsu (site/demo-admin/demo-api.js):
  tab Demo Admin Desktop, Demo Admin Mobile, dan Galeri Template. Demo tidak pernah memanggil Apps Script.
- Blok "Ikuti Kliktiva" di footer (URL & nama dari sheet Settings).
- FAQ free trial mengikuti FreeTrialDays di sheet Settings (cadangan: 14).
- Bagian Harga (menu "Harga"): mulai Rp25.000/bulan, tahunan lebih hemat & bisa nego; tombol Hubungi Admin
  langsung ke WhatsApp Admin, termasuk kartu Personalisasi (harga nego) (nomor dari AdminWhatsappNumber di sheet Settings).
- src/index.js (Worker) dan wrangler.jsonc TIDAK berubah.

LANGKAH DEPLOY (repo GitHub yang sama dengan v1.3)
1. Apps Script formulir konsultasi (lakukan dulu):
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
