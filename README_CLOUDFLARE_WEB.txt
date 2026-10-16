KLIKTIVA WEBSITE (MARKETING) — PAKET CLOUDFLARE WORKER v1.3

ISI
- site/            -> halaman (index.html, _headers)
- src/index.js     -> Worker: menyajikan halaman + proxy form konsultasi di /api/kliktiva
- apps-script/     -> backend form konsultasi (tidak berubah)
- legacy-netlify/  -> berkas versi Netlify (tidak dipakai)

LANGKAH
1. GitHub: buat repo baru (Private), unggah ISI folder ini ke root repo (bukan zip-nya).
   Pastikan wrangler.jsonc, folder src dan folder site terlihat di halaman utama repo.
2. Cloudflare > Workers & Pages > Create > Import a repository > pilih repo.
   Project name HARUS sama dengan "name" di wrangler.jsonc (default: kliktiva-web).
   Build command kosong, Deploy command: npx wrangler deploy. Deploy.
3. Setelah sukses: Worker > Settings > Variables and secrets > tambah
     KLIKTIVA_APPS_SCRIPT_URL = URL Web App Apps Script berakhiran /exec  (tipe Secret)
   (nilainya sama dengan variabel di situs Netlify lama: Netlify > Site > Environment variables)
   lalu deploy ulang.
4. Uji di alamat workers.dev SEBELUM memindahkan domain:
     /                              -> halaman Kliktiva tampil
     /api/kliktiva?action=health    -> JSON dari Apps Script (bukan error 503/502)
   Coba kirim satu formulir konsultasi dari halaman.
5. Pindahkan domain:
   a. Cloudflare > DNS > Records: HAPUS CNAME "@" (kliktiva.my.id) dan CNAME "www" yang mengarah ke Netlify.
   b. Worker > Settings > Domains & Routes > Add > Custom Domain:
        kliktiva.my.id  lalu  www.kliktiva.my.id
   c. Tunggu sertifikat terbit (biasanya beberapa menit), lalu buka https://kliktiva.my.id
6. Setelah stabil beberapa hari: lepas domain dari situs Netlify lama.

PEMERIKSAAN LOKAL
  npm run check:all
