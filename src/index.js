// Worker website marketing Kliktiva.
// Halaman statis (folder site) disajikan otomatis; Worker hanya menangani /api/kliktiva
// (proxy tipis ke Google Apps Script untuk form konsultasi).
// Variabel yang dibutuhkan: KLIKTIVA_APPS_SCRIPT_URL (URL Web App berakhiran /exec).

const MAX_BODY_BYTES = 30000;
const SCRIPT_URL_RE = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
      'x-content-type-options': 'nosniff'
    }
  });
}

export async function handleKliktivaApi(request, env) {
  const requestUrl = new URL(request.url);
  const method = request.method.toUpperCase();
  if (!['GET', 'POST', 'OPTIONS'].includes(method)) {
    return json({ ok: false, error: 'METHOD_NOT_ALLOWED', message: 'Metode tidak didukung.' }, 405);
  }
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { allow: 'GET, POST, OPTIONS' } });
  }

  const scriptUrl = String((env && env.KLIKTIVA_APPS_SCRIPT_URL) || '').trim();
  if (!SCRIPT_URL_RE.test(scriptUrl)) {
    return json({
      ok: false,
      error: 'BACKEND_NOT_CONFIGURED',
      message: 'Backend konsultasi belum dikonfigurasi. Admin perlu mengisi variabel KLIKTIVA_APPS_SCRIPT_URL di Cloudflare lalu deploy ulang.'
    }, 503);
  }

  try {
    let targetUrl;
    let options = { method: 'GET', redirect: 'follow', headers: { accept: 'application/json' } };
    if (method === 'GET') {
      const action = requestUrl.searchParams.get('action') || 'config';
      if (!['config', 'health'].includes(action)) return json({ ok: false, error: 'ACTION_NOT_ALLOWED' }, 400);
      targetUrl = new URL(scriptUrl);
      targetUrl.searchParams.set('action', action);
    } else {
      const raw = await request.text();
      if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
        return json({ ok: false, error: 'PAYLOAD_TOO_LARGE', message: 'Data formulir terlalu besar.' }, 413);
      }
      let payload;
      try { payload = JSON.parse(raw || '{}'); }
      catch { return json({ ok: false, error: 'INVALID_JSON', message: 'Data formulir tidak valid.' }, 400); }
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return json({ ok: false, error: 'INVALID_BODY', message: 'Data formulir tidak valid.' }, 400);
      }
      targetUrl = scriptUrl;
      options = {
        method: 'POST',
        redirect: 'follow',
        headers: { 'content-type': 'application/json; charset=utf-8', accept: 'application/json' },
        body: JSON.stringify(payload)
      };
    }

    const upstream = await fetch(targetUrl, { ...options, signal: AbortSignal.timeout(20000) });
    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); }
    catch {
      return json({ ok: false, error: 'UPSTREAM_INVALID_RESPONSE', message: 'Respons Google Apps Script tidak dapat dibaca. Periksa URL Web App dan deployment.' }, 502);
    }
    return json(data, upstream.ok ? 200 : 502);
  } catch (error) {
    const timedOut = String((error && error.name) || '').includes('Timeout');
    return json({
      ok: false,
      error: timedOut ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_UNAVAILABLE',
      message: timedOut ? 'Server membutuhkan waktu terlalu lama. Silakan coba lagi.' : 'Backend belum dapat dihubungi. Periksa deployment Apps Script dan coba lagi.'
    }, 502);
  }
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/kliktiva') return handleKliktivaApi(request, env);
    if (pathname.startsWith('/api/')) return new Response(JSON.stringify({ ok: false, error: 'NOT_FOUND' }), { status: 404, headers: { 'content-type': 'application/json; charset=utf-8' } });
    return env.ASSETS.fetch(request);
  }
};
