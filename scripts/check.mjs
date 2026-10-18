import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
for (const f of ['site/index.html', 'site/_headers', 'src/index.js', 'wrangler.jsonc', 'site/assets/kliktiva-logo.png', 'site/assets/template-gallery-data.js', 'site/demo-admin/admin.html', 'site/demo-admin/top100-admin.html', 'site/demo-admin/top100-renderer.html', 'site/demo-admin/index.html', 'site/demo-admin/demo-api.js']) assert.ok(existsSync(f), `File wajib tidak ada: ${f}`);
const sx = spawnSync(process.execPath, ['--check', 'src/index.js'], { encoding: 'utf8' });
assert.equal(sx.status, 0, sx.stderr);
const html = readFileSync('site/index.html', 'utf8');
assert.ok(!html.includes('/.netlify/functions'), 'index.html masih memanggil jalur Netlify');
assert.ok(html.includes("'/api/kliktiva'"), "index.html harus memakai '/api/kliktiva'");
const w = readFileSync('wrangler.jsonc', 'utf8');
assert.ok(/"name"\s*:\s*"[a-z0-9-]+"/.test(w), 'name wrangler hanya boleh huruf kecil, angka, tanda hubung');
assert.ok(w.includes('"/api/*"'), 'run_worker_first harus memuat /api/*');
for (const f of ['site/demo-admin/admin.html', 'site/demo-admin/index.html']) {
  const page = readFileSync(f, 'utf8');
  assert.ok(page.indexOf('demo-api.js') > -1 && page.indexOf('demo-api.js') < page.indexOf('<script>'), `${f}: demo-api.js harus dimuat sebelum skrip lain (Demo Admin tidak boleh memanggil backend asli)`);
}
assert.ok(!html.includes('preview-flag">'), 'Label preview lokal tidak boleh ikut ter-deploy');
console.log('OK: paket website Cloudflare lolos pemeriksaan statis.');
