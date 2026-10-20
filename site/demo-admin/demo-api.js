/* Kliktiva — backend palsu untuk Demo Web Admin di website marketing.
   Semua panggilan /api dijawab di browser dengan data contoh. Tidak ada koneksi ke Apps Script,
   Google Sheets, atau data pelanggan mana pun. Perubahan hanya tersimpan selama halaman terbuka. */
(function () {
  'use strict';
  var IMG = function (id, w) { return 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=' + (w || 900) + '&q=82'; };
  var P = {
    fashion: 'photo-1539109136881-3be0616acf4b', bag: 'photo-1584917865442-de89df76afd3', backpack: 'photo-1553062407-98eeb64c6a62',
    skincare: 'photo-1608248543803-ba4f8c70ae0b', beauty: 'photo-1608571423902-eed4a5ad8108', craft: 'photo-1452860606245-08befc0ff44b',
    watch: 'photo-1523275335684-37898b6baf30', desk: 'photo-1455390582262-044cdead277a', cafe: 'photo-1517248135467-4c7edcad34c4',
    camera: 'photo-1516035069371-29a1b244cc32', creator: 'photo-1492619375914-88005aa9e8fb', laptop: 'photo-1498050108023-c5249f4df085',
    work: 'photo-1516321318423-f06f85e504b3', coffee: 'photo-1495474472287-4d71bcdd2085', bread: 'photo-1509440159596-0249088772ff'
  };
  var DEMO_BRAND = 'Rona Living';
  var PLAN = /[?&]plan=paid/.test(location.search) ? 'paid' : 'free';
  function isoShift(days) { return new Date(Date.now() + 7 * 3600000 + days * 86400000).toISOString().slice(0, 10); }
  function ctaFields() { return PLAN === 'free' ? { websiteCtaEnabled: 'true', websiteCtaUrl: 'https://app.kliktiva.my.id/?ref=ronaliving' } : { websiteCtaEnabled: 'false', websiteCtaUrl: '' }; }

  // ---------------- Katalog contoh ----------------
  var COLLECTIONS = [
    { id: 1, name: 'Best Seller Minggu Ini', description: 'Produk yang paling banyak dicari pelanggan minggu ini.', cover: P.fashion },
    { id: 2, name: 'Fashion & Hijab', description: 'Busana harian, hijab, dan aksesori untuk tampil rapi setiap hari.', cover: P.bag },
    { id: 3, name: 'Skincare & Beauty', description: 'Perawatan kulit dan kecantikan pilihan dengan bahan yang aman.', cover: P.skincare },
    { id: 4, name: 'Home & Living', description: 'Dekorasi dan perlengkapan rumah untuk suasana yang lebih hangat.', cover: P.craft },
    { id: 5, name: 'Gadget & Work Setup', description: 'Gadget dan perlengkapan kerja untuk produktivitas harian.', cover: P.laptop },
    { id: 6, name: 'Hampers & Hadiah', description: 'Paket hadiah siap kirim untuk momen spesial.', cover: P.coffee },
    { id: 7, name: 'Promo Gajian', description: 'Harga spesial terbatas setiap akhir bulan.', cover: P.watch }
  ];
  var PRODUCTS = [
    [1, 'Tunik Linen Everyday', 'Tunik linen adem dengan potongan longgar, nyaman dipakai dari pagi sampai malam.', 'Rp129.000', [1, 2], [P.fashion, P.bag, P.beauty], 'product', 'https://shopee.co.id/rona-living-tunik-linen'],
    [2, 'Hijab Voal Premium Ultrafine', 'Voal lembut tidak menerawang, tegak di dahi, tersedia 24 warna.', 'Rp49.000', [1, 2], [P.bag, P.fashion, P.beauty], 'product', 'https://shopee.co.id/rona-living-hijab-voal'],
    [3, 'Serum Daily Glow 20ml', 'Serum niacinamide 5% untuk kulit tampak cerah dan lembap.', 'Rp99.000', [1, 3], [P.skincare, P.beauty, P.fashion], 'product', 'https://www.tokopedia.com/ronaliving/serum-daily-glow'],
    [4, 'Tas Selempang Casual', 'Tas selempang ringan dengan 4 kompartemen, muat HP, dompet, dan powerbank.', 'Rp159.000', [2, 7], [P.backpack, P.bag, P.fashion], 'product', 'https://shopee.co.id/rona-living-tas-selempang'],
    [5, 'Gamis Katun Rayon Motif Bunga', 'Gamis busui friendly dengan resleting depan dan saku samping.', 'Rp189.000', [2], [P.fashion, P.bag, P.beauty], 'product', 'https://shopee.co.id/rona-living-gamis-rayon'],
    [6, 'Ciput Rajut Anti Pusing', 'Ciput elastis yang nyaman dipakai seharian.', 'Rp25.000', [2], [P.bag, P.beauty, P.fashion], 'product', 'https://shopee.co.id/rona-living-ciput'],
    [7, 'Sunscreen Gel SPF 50 PA++++', 'Tekstur gel ringan, tidak lengket, tanpa whitecast.', 'Rp79.000', [1, 3, 7], [P.beauty, P.skincare, P.fashion], 'product', 'https://www.tokopedia.com/ronaliving/sunscreen-gel'],
    [8, 'Lip Tint Velvet Matte', 'Warna intens yang tahan lama dengan hasil akhir velvet.', 'Rp45.000', [3], [P.skincare, P.beauty, P.bag], 'product', 'https://shopee.co.id/rona-living-lip-tint'],
    [9, 'Facial Wash Gentle Foam', 'Pembersih wajah pH seimbang untuk kulit sensitif.', 'Rp55.000', [3], [P.beauty, P.skincare, P.fashion], 'product', 'https://shopee.co.id/rona-living-facial-wash'],
    [10, 'Paket Skincare Pemula', 'Facial wash, serum, dan sunscreen dalam satu paket hemat.', 'Rp199.000', [3, 6, 7], [P.skincare, P.beauty, P.coffee], 'whatsapp', ''],
    [11, 'Lampu Meja Minimalis', 'Lampu meja kayu dengan cahaya hangat 3 tingkat.', 'Rp175.000', [4, 5], [P.desk, P.craft, P.work], 'product', 'https://shopee.co.id/rona-living-lampu-meja'],
    [12, 'Keramik Mug Handmade', 'Mug keramik buatan perajin lokal, setiap mug punya karakter unik.', 'Rp85.000', [4, 6], [P.craft, P.coffee, P.cafe], 'product', 'https://shopee.co.id/rona-living-mug-handmade'],
    [13, 'Lilin Aromaterapi Lavender', 'Lilin soy wax dengan aroma lavender yang menenangkan, 40 jam pembakaran.', 'Rp69.000', [1, 4, 6], [P.craft, P.desk, P.cafe], 'product', 'https://www.tokopedia.com/ronaliving/lilin-aromaterapi'],
    [14, 'Rak Dinding Kayu Jati', 'Rak dinding serbaguna dari kayu jati Belanda.', 'Rp139.000', [4], [P.desk, P.craft, P.work], 'product', 'https://shopee.co.id/rona-living-rak-dinding'],
    [15, 'Sarung Bantal Linen Earth Tone', 'Set 2 sarung bantal 45x45 cm dengan warna natural.', 'Rp95.000', [4, 7], [P.craft, P.desk, P.cafe], 'product', 'https://shopee.co.id/rona-living-sarung-bantal'],
    [16, 'Wireless Earbuds Lite', 'Earbuds bluetooth 5.3 dengan baterai 30 jam dan mode low latency.', 'Rp219.000', [1, 5, 7], [P.laptop, P.work, P.camera], 'product', 'https://shopee.co.id/rona-living-earbuds'],
    [17, 'Stand Laptop Aluminium', 'Stand laptop lipat 6 level ketinggian untuk postur kerja lebih baik.', 'Rp149.000', [5], [P.work, P.laptop, P.desk], 'product', 'https://www.tokopedia.com/ronaliving/stand-laptop'],
    [18, 'Ring Light 10 Inch + Tripod', 'Ring light 3 mode warna untuk live jualan dan konten video.', 'Rp129.000', [5], [P.camera, P.creator, P.laptop], 'product', 'https://shopee.co.id/rona-living-ring-light'],
    [19, 'Jam Tangan Klasik Kulit', 'Jam tangan analog dengan strap kulit asli dan kaca sapphire.', 'Rp329.000', [5, 6], [P.watch, P.backpack, P.desk], 'product', 'https://shopee.co.id/rona-living-jam-tangan'],
    [20, 'Mouse Wireless Silent Click', 'Mouse tanpa suara klik, cocok untuk kerja di kafe.', 'Rp89.000', [5], [P.laptop, P.work, P.desk], 'product', 'https://shopee.co.id/rona-living-mouse'],
    [21, 'Hampers Kopi Nusantara', 'Tiga varian kopi single origin, mug handmade, dan kartu ucapan.', 'Rp245.000', [1, 6], [P.coffee, P.cafe, P.bread], 'whatsapp', ''],
    [22, 'Hampers Self Care Box', 'Lilin aromaterapi, serum, dan hijab voal dalam box eksklusif.', 'Rp299.000', [6], [P.craft, P.skincare, P.coffee], 'whatsapp', ''],
    [23, 'Paket Kue Kering Lebaran', 'Nastar, kastengel, dan putri salju dalam toples premium.', 'Rp185.000', [6], [P.bread, P.coffee, P.cafe], 'whatsapp', ''],
    [24, 'Custom Hampers Kantor', 'Hampers untuk klien dan karyawan, bisa custom logo perusahaan.', 'Mulai Rp150.000', [6], [P.coffee, P.craft, P.work], 'whatsapp', ''],
    [25, 'Kacamata Anti Radiasi', 'Lensa blue light filter untuk mata yang lebih nyaman di depan layar.', 'Rp119.000', [5, 7], [P.work, P.laptop, P.watch], 'product', 'https://shopee.co.id/rona-living-kacamata'],
    [26, 'Outer Rajut Oversize', 'Outer rajut lembut dengan model oversize kekinian.', 'Rp139.000', [2, 7], [P.fashion, P.bag, P.backpack], 'product', 'https://shopee.co.id/rona-living-outer-rajut'],
    [27, 'Body Lotion Brightening', 'Lotion dengan vitamin C dan E, menyerap cepat tanpa lengket.', 'Rp65.000', [3], [P.beauty, P.skincare, P.craft], 'product', 'https://shopee.co.id/rona-living-body-lotion'],
    [28, 'Koleksi Baru (draft)', 'Produk baru yang sedang disiapkan sebelum tayang.', 'Segera hadir', [2], [P.bag, '', ''], 'product', '']
  ].map(function (r, i) {
    return { id: r[0], name: r[1], description: r[2], price: r[3], collectionIds: r[4].slice(), photos: r[5].map(function (x) { return x ? IMG(x) : ''; }), linkType: r[6], url: r[7], status: r[0] === 28 ? 'DRAFT' : 'PUBLISH', order: i + 1 };
  });

  function seedState() {
    var collections = COLLECTIONS.map(function (c, i) {
      return { id: c.id, name: c.name, productIds: [], order: i + 1, published: true, description: c.description, coverUrl: IMG(c.cover), coverUrlFallback: '' };
    });
    var products = JSON.parse(JSON.stringify(PRODUCTS));
    collections.forEach(function (c) { c.productIds = products.filter(function (p) { return p.collectionIds.indexOf(c.id) >= 0; }).map(function (p) { return p.id; }); });
    return {
      selectedTemplate: 1, page: 'home', openCollection: null, language: 'id', sidebarCollapsed: false,
      homeLabels: { favoriteCollections: 'Koleksi Favorit', favoriteProducts: 'Paling Dicari', about: 'Tentang Kami' },
      publicLabels: { collection: 'Koleksi', product: 'Produk', productButton: 'Beli Sekarang', productButtonWa: 'Pesan via WhatsApp' },
      profile: {
        name: DEMO_BRAND, photoUrl: IMG(P.fashion, 400), photoUrlFallback: '',
        bio: 'Fashion, skincare, home living, dan gadget pilihan untuk hidup yang lebih rapi dan menyenangkan.',
        motto: 'Pilihan cantik untuk setiap hari.',
        about: 'Rona Living berawal dari toko kecil di Bandung pada 2021. Kini kami mengkurasi lebih dari seratus produk pilihan dari brand lokal dan marketplace terpercaya, lengkap dengan ulasan jujur dan link belanja yang aman. Pesan lewat Shopee, Tokopedia, atau langsung chat kami di WhatsApp.',
        seoTitle: 'Rona Living | Fashion, Skincare & Home Living Pilihan',
        seoDescription: 'Katalog Rona Living: fashion muslimah, skincare, dekorasi rumah, gadget, dan hampers. Belanja lewat Shopee, Tokopedia, atau WhatsApp.',
        address: 'Jl. Riau No. 18, Citarum, Bandung Wetan, Kota Bandung, Jawa Barat 40115',
        locationMode: 'coordinates', coordinates: '-6.9089, 107.6181', mapsUrl: '',
        bannerUrl: IMG(P.craft, 1200), bannerUrlFallback: '', bannerFit: 'cover', bannerX: 50, bannerY: 50, bannerZoom: 1
      },
      homeVisibility: { profilePhoto: true, banner: true, name: true, bio: true, motto: true, about: true, location: true, favoriteCollections: true, favoriteProducts: true },
      settings: { font: 'inter' },
      links: [
        { id: 'link-1', type: 'WhatsApp', label: 'Chat WhatsApp', url: 'https://wa.me/6281234567890', active: true, order: 1 },
        { id: 'link-2', type: 'Instagram', label: 'Instagram', url: 'https://www.instagram.com/ronaliving.id', active: true, order: 2 },
        { id: 'link-3', type: 'TikTok', label: 'TikTok', url: 'https://www.tiktok.com/@ronaliving.id', active: true, order: 3 },
        { id: 'link-4', type: 'Shopee', label: 'Shopee', url: 'https://shopee.co.id/ronaliving', active: true, order: 4 },
        { id: 'link-5', type: 'Custom', label: 'Tokopedia', url: 'https://www.tokopedia.com/ronaliving', active: true, order: 5 },
        { id: 'link-6', type: 'YouTube', label: 'YouTube', url: 'https://www.youtube.com/@ronaliving', active: true, order: 6 },
        { id: 'link-7', type: 'Threads', label: 'Threads', url: 'https://www.threads.net/@ronaliving.id', active: true, order: 7 },
        { id: 'link-8', type: 'Facebook', label: 'Facebook', url: 'https://www.facebook.com/ronaliving.id', active: true, order: 8 },
        { id: 'link-9', type: 'Custom', label: 'Form Reseller', url: 'https://forms.gle/contoh-reseller', active: true, order: 9 }
      ],
      collections: collections, products: products,
      favoriteCollectionIds: [1, 2, 3, 4, 6], favoriteProductIds: [3, 2, 1, 16, 21, 7],
      navigation: { items: [{ key: 'home', label: 'Beranda', order: 1 }, { key: 'findme', label: 'Hubungi Kami', order: 2 }, { key: 'collections', label: 'Katalog', order: 3 }] },
      publicContact: { websiteCtaEnabled: 'false' }
    };
  }
  var STATE = seedState();
  var ACCOUNTS = [
    { username: 'owner.rona', role: 'SYSTEM_ADMIN', createdAt: '12/03/2025 09:12', updatedAt: '02/10/2026 14:40' },
    { username: 'admin.toko', role: 'USER', createdAt: '20/04/2025 10:05', updatedAt: '11/09/2026 08:21' },
    { username: 'tim.konten', role: 'USER', createdAt: '05/01/2026 16:30', updatedAt: '05/01/2026 16:30' }
  ];

  // Bentuk data legacy (adminGetData) dibangun dari state Kliktiva.
  function legacyData() {
    var s = STATE, p = s.profile;
    var colName = {}; s.collections.forEach(function (c) { colName[c.id] = c.name; });
    var link = function (t) { var l = s.links.filter(function (x) { return x.type === t; })[0]; return l ? l.url : ''; };
    return {
      profile: {
        name: p.name, photoUrl: p.photoUrl, photoUrlFallback: '', bio: p.bio, motto: p.motto, theme: 'lavender', fontTheme: 'inter', uiTemplate: String(s.selectedTemplate),
        instagram: 'ronaliving.id', tiktok: 'ronaliving.id', shopee: 'ronaliving', youtube: 'ronaliving', facebook: 'ronaliving.id', threads: 'ronaliving.id',
        other1Label: 'Tokopedia', other1Url: link('Custom'), other2Label: '', other2Url: '', other3Label: '', other3Url: '', other4Label: '', other4Url: '', other5Label: '', other5Url: '',
        activationCode: 'KLIKTIVA-DEMO-2026', about: p.about, seoTitle: p.seoTitle, seoDescription: p.seoDescription, address: p.address,
        websiteCtaWhatsapp: '', websiteCtaLabel: 'Mau website seperti ini? Chat Admin', websiteCtaEnabled: ctaFields().websiteCtaEnabled, websiteCtaUrl: ctaFields().websiteCtaUrl
      },
      products: s.products.map(function (x) {
        var cid = x.collectionIds[0] || '';
        return { ProductID: x.id, 'Judul Produk': x.name, 'Link Affiliate': x.url, 'Link Gambar': x.photos[0] || '', Status: x.status, KoleksiID: cid, Koleksi: cid ? colName[cid] : '', UrutanTampilan: x.order, 'Harga Tampil': x.price, 'Label Tombol': 'Lihat Produk', 'Thumbnail Otomatis': '' };
      }),
      collections: s.collections.map(function (c) { return { CollectionID: c.id, 'Nama Koleksi': c.name, UrutanTampilan: c.order }; }),
      role: 'SYSTEM_ADMIN', username: 'owner.rona'
    };
  }

  // ---------------- Analytics contoh (deterministik, tersedia untuk tanggal kapan pun) ----------------
  var START_DATE = '2025-03-12';
  function rnd(seed) { var x = Math.sin(seed * 12.9898) * 43758.5453; return x - Math.floor(x); }
  function dayNum(iso) { return Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000); }
  function isoOf(n) { return new Date(n * 86400000).toISOString().slice(0, 10); }
  function label(iso) { return iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4); }
  var HOUR_W = [2, 1, 1, 0.5, 0.5, 1, 3, 5, 6, 7, 7, 8, 11, 10, 7, 6, 6, 7, 9, 12, 14, 13, 9, 5];
  var HW_SUM = HOUR_W.reduce(function (a, b) { return a + b; }, 0);
  var WD_W = [1.25, 0.9, 0.92, 0.95, 1.0, 1.12, 1.3]; // Minggu..Sabtu
  function dayStats(iso) {
    var n = dayNum(iso), n0 = dayNum(START_DATE);
    if (n < n0) return null;
    var age = n - n0;
    var growth = 60 + Math.min(age, 600) * 0.55; // tumbuh dari ~60 ke ~390 kunjungan/hari
    var wd = new Date(n * 86400000).getUTCDay();
    var payday = (+iso.slice(8, 10) >= 25 || +iso.slice(8, 10) <= 2) ? 1.22 : 1;
    var noise = 0.82 + rnd(n) * 0.36;
    var pv = Math.round(growth * WD_W[wd] * payday * noise);
    var uv = Math.round(pv * (0.62 + rnd(n + 3) * 0.08));
    var coll = Math.round(pv * (0.41 + rnd(n + 5) * 0.08));
    var pc = Math.round(pv * (0.27 + rnd(n + 7) * 0.07));
    var sc = Math.round(pv * (0.11 + rnd(n + 9) * 0.04));
    return { iso: iso, wd: wd, pageViews: pv, uniqueVisitors: uv, collectionViews: coll, productClicks: pc, socialClicks: sc, productViews: Math.round(pv * 0.58) };
  }
  function rangeDays(from, to) {
    var out = [], a = dayNum(from), b = dayNum(to);
    if (b - a > 1500) a = b - 1500;
    for (var n = a; n <= b; n++) { var d = dayStats(isoOf(n)); if (d) out.push(d); }
    return out;
  }
  var PRODUCT_W = { 3: 9.5, 2: 8.8, 1: 8.1, 16: 7.4, 7: 6.9, 21: 6.2, 10: 5.6, 4: 5.1, 19: 4.6, 13: 4.2, 18: 3.9, 5: 3.6, 26: 3.2, 12: 2.9, 22: 2.7, 17: 2.4, 11: 2.2, 8: 2.0, 25: 1.8, 9: 1.6 };
  var COLL_W = { 1: 9, 3: 7.5, 2: 7, 6: 5.2, 5: 4.4, 4: 3.8, 7: 3.1 };
  var SOCIAL = [['other1', 'WhatsApp', 9], ['instagram', 'Instagram', 7.2], ['shopee', 'Shopee', 6.1], ['tiktok', 'TikTok', 5.4], ['other2', 'Tokopedia', 3.1], ['youtube', 'YouTube', 1.8], ['threads', 'Threads', 1.1], ['facebook', 'Facebook', 0.9], ['other3', 'Form Reseller', 0.7]];
  function split(total, weights) {
    var sum = weights.reduce(function (a, b) { return a + b; }, 0);
    return weights.map(function (w) { return Math.round(total * w / sum); });
  }
  function productName(id) { var p = STATE.products.filter(function (x) { return x.id === Number(id); })[0]; return p ? p.name : ('Produk ' + id); }
  function collName(id) { var c = STATE.collections.filter(function (x) { return x.id === Number(id); })[0]; return c ? c.name : ('Koleksi ' + id); }
  function dashboard(from, to) {
    var days = rangeDays(from, to);
    var sum = { pageViews: 0, uniqueVisitors: 0, collectionViews: 0, productClicks: 0, socialClicks: 0 };
    days.forEach(function (d) { for (var k in sum) sum[k] += d[k]; });
    var hc = split(sum.productClicks + sum.socialClicks, HOUR_W), hv = split(sum.uniqueVisitors, HOUR_W);
    var hpc = split(sum.productClicks, HOUR_W);
    var pIds = Object.keys(PRODUCT_W), pc = split(sum.productClicks, pIds.map(function (k) { return PRODUCT_W[k]; }));
    var cIds = Object.keys(COLL_W), cc = split(sum.collectionViews, cIds.map(function (k) { return COLL_W[k]; }));
    var sc = split(sum.socialClicks, SOCIAL.map(function (s) { return s[2]; }));
    var byClicks = function (a, b) { return b.clicks - a.clicks; };
    return {
      days: days.length,
      range: { fromDate: from, toDate: to, fromLabel: label(from), toLabel: label(to) },
      summary: { pageViews: sum.pageViews, uniqueVisitors: sum.uniqueVisitors, collectionViews: sum.collectionViews, productClicks: sum.productClicks, socialClicks: sum.socialClicks, ctr: sum.pageViews ? Math.round(sum.productClicks / sum.pageViews * 10000) / 100 : 0 },
      daily: days.map(function (d) { return { date: label(d.iso), dateLabel: label(d.iso), pageViews: d.pageViews, uniqueVisitors: d.uniqueVisitors, collectionViews: d.collectionViews, productClicks: d.productClicks, socialClicks: d.socialClicks }; }),
      hourlyClicks: HOUR_W.map(function (_, h) { return { hour: h, totalClicks: hc[h], productClicks: hpc[h], socialClicks: Math.max(0, hc[h] - hpc[h]) }; }),
      hourlyVisitors: HOUR_W.map(function (_, h) { return { hour: h, visitors: hv[h] }; }),
      topProducts: pIds.map(function (id, i) { return { id: id, name: productName(id), clicks: pc[i] }; }).sort(byClicks).slice(0, 10),
      topCollections: cIds.map(function (id, i) { return { id: id, name: collName(id), clicks: cc[i] }; }).sort(byClicks).slice(0, 10),
      topSocial: SOCIAL.map(function (s, i) { return { id: s[0], name: s[1], clicks: sc[i] }; }).sort(byClicks)
    };
  }
  function totals(days) {
    var t = { pageViews: 0, uniqueVisitors: 0, productViews: 0, productClicks: 0, socialClicks: 0, collectionViews: 0 };
    days.forEach(function (d) { t.pageViews += d.pageViews; t.uniqueVisitors += d.uniqueVisitors; t.productViews += d.productViews; t.productClicks += d.productClicks; t.socialClicks += d.socialClicks; t.collectionViews += d.collectionViews; });
    t.totalClicks = t.productClicks + t.socialClicks; return t;
  }
  function list(total, rows) {
    var parts = split(total, rows.map(function (r) { return r[2]; }));
    return rows.map(function (r, i) { var pv = parts[i]; return { key: r[0], label: r[1], pageViews: pv, clicks: Math.round(pv * 0.38), visitors: Math.round(pv * 0.66) }; });
  }
  function insights(from, to) {
    var span = dayNum(to) - dayNum(from) + 1;
    var cur = rangeDays(from, to), prev = rangeDays(isoOf(dayNum(from) - span), isoOf(dayNum(from) - 1));
    var t = totals(cur), pt = totals(prev);
    var grid = [];
    for (var d = 0; d < 7; d++) { var row = []; for (var h = 0; h < 24; h++) row.push(Math.round(t.pageViews / 7 / HW_SUM * HOUR_W[h] * WD_W[d] * (0.85 + rnd(d * 31 + h) * 0.3))); grid.push(row); }
    var windows = [];
    for (d = 0; d < 7; d++) for (h = 0; h < 23; h++) windows.push({ weekday: d, startHour: h, endHour: h + 2, pageViews: grid[d][h] + grid[d][h + 1] });
    windows.sort(function (a, b) { return b.pageViews - a.pageViews; });
    var best = [];
    windows.forEach(function (w) { if (best.length < 3 && !best.some(function (x) { return x.weekday === w.weekday && Math.abs(x.startHour - w.startHour) < 2; })) best.push(w); });
    var pIds = Object.keys(PRODUCT_W), clicks = split(t.productClicks, pIds.map(function (k) { return PRODUCT_W[k]; }));
    var views = split(t.productViews, pIds.map(function (k, i) { return PRODUCT_W[k] * (1.6 + rnd(i) * 1.4); }));
    var cIds = Object.keys(COLL_W), cv = split(t.collectionViews, cIds.map(function (k) { return COLL_W[k]; }));
    return {
      range: { fromDate: from, toDate: to, prevFromDate: isoOf(dayNum(from) - span), prevToDate: isoOf(dayNum(from) - 1), days: span },
      totals: t, prevTotals: pt,
      sources: list(t.pageViews, [['instagram', 'instagram', 34], ['tiktok', 'tiktok', 27], ['whatsapp', 'whatsapp', 14], ['direct', 'direct', 9], ['google', 'google', 7], ['youtube', 'youtube', 4], ['threads', 'threads', 3], ['facebook', 'facebook', 2]]),
      devices: list(t.pageViews, [['mobile', 'mobile', 86], ['desktop', 'desktop', 11], ['tablet', 'tablet', 3]]),
      countries: list(t.pageViews, [['ID', 'ID', 94], ['MY', 'MY', 3], ['SG', 'SG', 2], ['SA', 'SA', 1]]),
      regions: list(t.pageViews, [['ID|Jawa Barat', 'Jawa Barat, ID', 31], ['ID|DKI Jakarta', 'DKI Jakarta, ID', 24], ['ID|Jawa Timur', 'Jawa Timur, ID', 14], ['ID|Jawa Tengah', 'Jawa Tengah, ID', 10], ['ID|Banten', 'Banten, ID', 8], ['ID|Sumatera Utara', 'Sumatera Utara, ID', 5], ['ID|Sulawesi Selatan', 'Sulawesi Selatan, ID', 4], ['ID|Bali', 'Bali, ID', 4]]),
      products: pIds.map(function (id, i) { var v = Math.max(views[i], clicks[i] + 1); return { id: id, name: productName(id), views: v, clicks: clicks[i], ctr: Math.round(Math.min(100, clicks[i] / v * 100) * 10) / 10 }; }).sort(function (a, b) { return b.clicks - a.clicks; }).slice(0, 15),
      collections: cIds.map(function (id, i) { return { id: id, name: collName(id), views: cv[i] }; }).sort(function (a, b) { return b.views - a.views; }),
      bestTimes: { grid: grid, bestWindows: best, hasData: t.pageViews > 0 },
      coverage: { pageViews: t.pageViews, withSource: Math.round(t.pageViews * 0.91), withDevice: t.pageViews, withCountry: Math.round(t.pageViews * 0.88) }
    };
  }

  // ---------------- Simpan (hanya di memori) ----------------
  function nextId(arr) { return arr.reduce(function (m, x) { return Math.max(m, Number(x.id) || 0); }, 0) + 1; }
  function saveTop100(payload, scope) {
    var incoming = JSON.parse(JSON.stringify(payload || {}));
    var s = STATE;
    function take(keys) { keys.forEach(function (k) { if (incoming[k] !== undefined) s[k] = incoming[k]; }); }
    if (scope === 'home' || scope === 'all') take(['profile', 'homeLabels', 'publicLabels', 'homeVisibility', 'favoriteCollectionIds', 'favoriteProductIds', 'navigation', 'settings', 'language']);
    if (scope === 'findme' || scope === 'all') take(['links']);
    if (scope === 'templates' || scope === 'all') take(['selectedTemplate', 'settings', 'profile']);
    if (scope === 'collections' || scope === 'products' || scope === 'all') {
      take(['collections', 'products']);
      // id baru (sementara/negatif/teks) diganti id angka
      var cmap = {};
      (s.collections || []).forEach(function (c) { if (!(Number(c.id) > 0)) { var nid = nextId(s.collections.filter(function (x) { return Number(x.id) > 0; })); cmap[c.id] = nid; c.id = nid; } });
      (s.products || []).forEach(function (p) {
        if (!(Number(p.id) > 0)) p.id = nextId(s.products.filter(function (x) { return Number(x.id) > 0; }));
        p.collectionIds = (p.collectionIds || []).map(function (id) { return cmap[id] !== undefined ? cmap[id] : Number(id); });
        if (!Array.isArray(p.photos)) p.photos = ['', '', ''];
        p.status = String(p.status || 'PUBLISH').toUpperCase();
      });
      s.collections.forEach(function (c) { c.productIds = s.products.filter(function (p) { return (p.collectionIds || []).indexOf(c.id) >= 0; }).map(function (p) { return p.id; }); });
    }
    var out = JSON.parse(JSON.stringify(s)); Object.assign(out.profile, ctaFields()); return { ok: true, scope: scope, state: out, message: 'Perubahan tersimpan (mode demo).' };
  }

  function todayIso() { var d = new Date(Date.now() + 7 * 3600000); return d.toISOString().slice(0, 10); }
  function handle(action, args) {
    switch (action) {
      case 'getLicenseStatus': {
        var free = PLAN === 'free';
        return { active: true, reason: free ? 'TRIAL' : 'AKTIF', status: free ? 'TRIAL' : 'AKTIF', message: free ? 'Masa trial aktif.' : 'Langganan aktif.',
          expiryDate: free ? isoShift(21) : isoShift(300), daysLeft: free ? 21 : 300, remind: false, grace: '', showWebsiteCta: free,
          adminPhone: '', contactUrl: 'https://app.kliktiva.my.id/', renewUrl: 'https://app.kliktiva.my.id/', ssoUrl: '', dashboardUrl: 'https://app.kliktiva.my.id/dashboard',
          hostname: 'ronaliving.kliktiva.my.id', clientId: 'ronaliving', siteName: DEMO_BRAND, packageId: free ? 'trial' : 'tahunan', licenseSessionToken: 'aktif' };
      }
      case 'adminHandoff': return { token: 'demo-admin-token', username: 'owner.rona', role: 'SYSTEM_ADMIN' };
      case 'activateLicense': return { active: true, message: 'Aktivasi berhasil (demo).' };
      case 'adminLogin': return { token: 'demo-admin-token', username: 'owner.rona', role: 'SYSTEM_ADMIN', expiresIn: 86400 };
      case 'getPublicDataVersion': return { version: 'demo-1' };
      case 'trackAnalyticsEvent': return { ok: true };
      case 'getPublicSeoMeta': return { title: STATE.profile.seoTitle, description: STATE.profile.seoDescription };
      case 'getPublicData': case 'adminGetData': return legacyData();
      case 'getTop100PublicData': case 'adminGetTop100State': { var st = JSON.parse(JSON.stringify(STATE)); Object.assign(st.profile, ctaFields(), { uiTemplate: String(st.selectedTemplate || 1), theme: 'lavender', fontTheme: 'inter' }); if (action === 'getTop100PublicData') {
          st.products = st.products.filter(function (p) { return p.status === 'PUBLISH'; });
          st.collections.forEach(function (c) { c.productIds = c.productIds.filter(function (id) { return st.products.some(function (p) { return p.id === id; }); }); });
          var byId = {}; st.collections.forEach(function (c) { byId[c.id] = c; });
          var products = st.products.map(function (p) { var first = (p.photos || [])[0] || ''; var cid = (p.collectionIds || [])[0] || null; return { id: p.id, title: p.name, link: p.linkType === 'whatsapp' ? '' : p.url, image: first, imageFallback: '', status: p.status, collectionId: cid, collection: cid && byId[cid] ? byId[cid].name : '', order: p.order, price: p.price, buttonLabel: p.linkType === 'whatsapp' ? 'Hubungi via WhatsApp' : 'Lihat Produk' }; });
          var collections = st.collections.map(function (c) { return { id: c.id, name: c.name, productCount: c.productIds.length, coverUrl: c.coverUrl || '', coverUrlFallback: '', previewImages: c.productIds.map(function (id) { var p = st.products.filter(function (x) { return x.id === id; })[0]; return p && p.photos[0] ? { url: p.photos[0], fallback: '' } : null; }).filter(Boolean).slice(0, 12) }; });
          return { profile: Object.assign({}, st.profile), products: products, collections: collections, top100: st };
        }
        return st; }
      case 'adminSaveTop100State': return saveTop100(args[1], String(args[2] || 'all').toLowerCase());
      case 'adminGetAnalytics': return dashboard(args[1] || isoOf(dayNum(todayIso()) - 29), args[2] || todayIso());
      case 'adminGetAnalyticsInsights': return insights(args[1] || isoOf(dayNum(todayIso()) - 29), args[2] || todayIso());
      case 'adminGetAccounts': return JSON.parse(JSON.stringify(ACCOUNTS));
      case 'adminSaveAccount': {
        var a = args[1] || {}, u = String(a.username || '').trim();
        if (!u) throw Object.assign(new Error('Username wajib diisi.'), { code: 'USERNAME_REQUIRED' });
        var ex = ACCOUNTS.filter(function (x) { return x.username === (a.originalUsername || u); })[0];
        var now = label(todayIso()) + ' 10:00';
        if (ex) { ex.username = u; ex.role = a.role || ex.role; ex.updatedAt = now; } else ACCOUNTS.push({ username: u, role: a.role || 'USER', createdAt: now, updatedAt: now });
        return { ok: true, message: 'Akun tersimpan (demo).' };
      }
      case 'adminDeleteAccount': ACCOUNTS = ACCOUNTS.filter(function (x) { return x.username !== args[1]; }); return { ok: true };
      case 'uploadImageToDrive': return { imageUrl: args[1], fileId: 'demo' };
      case 'adminGetDisplayProducts': return legacyData().products;
      default: return { ok: true, message: 'Tersimpan (mode demo).' };
    }
  }

  var realFetch = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (/(^|\/)api\/?(\?|$)/.test(url) || url === '/api') {
      var body = {};
      try { body = JSON.parse((init && init.body) || '{}'); } catch (_) { }
      var payload;
      try { payload = { ok: true, data: handle(String(body.action || ''), Array.isArray(body.args) ? body.args : []) }; }
      catch (e) { payload = { ok: false, code: e.code || 'DEMO_ERROR', error: e.message || String(e) }; }
      var delay = /^admin(Save|Delete)/.test(body.action) ? 450 : 120;
      return new Promise(function (resolve) {
        setTimeout(function () { resolve(new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } })); }, delay);
      });
    }
    return realFetch ? realFetch(input, init) : Promise.reject(new Error('fetch tidak tersedia'));
  };

  // Admin langsung masuk tanpa layar login, dan selalu mulai dari data contoh yang segar.
  try { sessionStorage.setItem('project_bio_admin_token', 'demo-admin-token'); } catch (_) { }
  try { Object.keys(localStorage).forEach(function (k) { if (/^kliktiva_demo_cache_/.test(k)) localStorage.removeItem(k); }); } catch (_) { }
  window.KLIKTIVA_DEMO = { state: function () { return STATE; }, reset: function () { STATE = seedState(); } };
})();
