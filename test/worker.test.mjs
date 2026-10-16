import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const URL_OK = 'https://script.google.com/macros/s/ABC123/exec';
const env = (extra = {}) => ({ ASSETS: { fetch: async (r) => new Response('ASET:' + new URL(r.url).pathname) }, ...extra });
const withFetch = async (impl, fn) => { const old = globalThis.fetch; globalThis.fetch = impl; try { return await fn(); } finally { globalThis.fetch = old; } };
const call = (path, init, e) => worker.fetch(new Request('https://h.test' + path, init), e);

test('halaman statis diserahkan ke aset', async () => {
  for (const p of ['/', '/index.html', '/apa-saja']) assert.equal(await (await call(p, undefined, env())).text(), 'ASET:' + p);
});
test('/api/lain -> 404 JSON', async () => { assert.equal((await call('/api/lain', undefined, env())).status, 404); });
test('variabel belum diisi -> 503', async () => {
  const r = await call('/api/kliktiva?action=health', undefined, env());
  assert.equal(r.status, 503); assert.equal((await r.json()).error, 'BACKEND_NOT_CONFIGURED');
});
test('metode tidak didukung -> 405', async () => { assert.equal((await call('/api/kliktiva', { method: 'DELETE' }, env({ KLIKTIVA_APPS_SCRIPT_URL: URL_OK }))).status, 405); });
test('GET config meneruskan action ke Apps Script', async () => {
  let seen;
  const r = await withFetch(async (u) => { seen = String(u); return new Response(JSON.stringify({ ok: true, data: 1 })); }, () => call('/api/kliktiva?action=config', undefined, env({ KLIKTIVA_APPS_SCRIPT_URL: URL_OK })));
  assert.equal(r.status, 200); assert.ok(seen.includes('action=config'));
});
test('GET action asing ditolak', async () => { assert.equal((await call('/api/kliktiva?action=hapus', undefined, env({ KLIKTIVA_APPS_SCRIPT_URL: URL_OK }))).status, 400); });
test('POST formulir diteruskan', async () => {
  let body;
  const r = await withFetch(async (u, i) => { body = i.body; return new Response(JSON.stringify({ ok: true })); }, () => call('/api/kliktiva', { method: 'POST', body: JSON.stringify({ nama: 'Budi' }) }, env({ KLIKTIVA_APPS_SCRIPT_URL: URL_OK })));
  assert.equal(r.status, 200); assert.equal(JSON.parse(body).nama, 'Budi');
});
test('POST terlalu besar -> 413', async () => { assert.equal((await call('/api/kliktiva', { method: 'POST', body: 'x'.repeat(31000) }, env({ KLIKTIVA_APPS_SCRIPT_URL: URL_OK }))).status, 413); });
test('POST JSON rusak -> 400', async () => { assert.equal((await call('/api/kliktiva', { method: 'POST', body: '{rusak' }, env({ KLIKTIVA_APPS_SCRIPT_URL: URL_OK }))).status, 400); });
test('upstream bukan JSON -> 502', async () => {
  const r = await withFetch(async () => new Response('<html>'), () => call('/api/kliktiva?action=health', undefined, env({ KLIKTIVA_APPS_SCRIPT_URL: URL_OK })));
  assert.equal(r.status, 502);
});
