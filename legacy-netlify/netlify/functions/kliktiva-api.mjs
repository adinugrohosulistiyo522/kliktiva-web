const MAX_BODY_BYTES = 30000;

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

function getScriptUrl() {
  return String(process.env.KLIKTIVA_APPS_SCRIPT_URL || '').trim();
}

export default async function handler(request) {
  const requestUrl = new URL(request.url);
  const method = request.method.toUpperCase();
  if (!['GET', 'POST', 'OPTIONS'].includes(method)) {
    return json({ ok: false, error: 'METHOD_NOT_ALLOWED', message: 'Metode tidak didukung.' }, 405);
  }
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'allow': 'GET, POST, OPTIONS' } });
  }

  const scriptUrl = getScriptUrl();
  if (!scriptUrl || !/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(scriptUrl)) {
    return json({
      ok: false,
      error: 'BACKEND_NOT_CONFIGURED',
      message: 'Backend konsultasi belum dikonfigurasi. Admin perlu mengisi environment variable KLIKTIVA_APPS_SCRIPT_URL di Netlify.'
    }, 503);
  }

  try {
    let targetUrl;
    let options = { method: 'GET', redirect: 'follow', headers: { 'accept': 'application/json' } };
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
        headers: { 'content-type': 'application/json; charset=utf-8', 'accept': 'application/json' },
        body: JSON.stringify(payload)
      };
    }

    const upstream = await fetch(targetUrl, { ...options, signal: AbortSignal.timeout(20000) });
    const upstreamText = await upstream.text();
    let data;
    try { data = JSON.parse(upstreamText); }
    catch {
      return json({ ok: false, error: 'UPSTREAM_INVALID_RESPONSE', message: 'Respons Google Apps Script tidak dapat dibaca. Periksa URL Web App dan deployment.' }, 502);
    }
    // GAS may return HTTP 200 even for application errors; preserve its JSON success flag.
    return json(data, upstream.ok ? 200 : 502);
  } catch (error) {
    const timedOut = String(error?.name || '').includes('Timeout');
    return json({
      ok: false,
      error: timedOut ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_UNAVAILABLE',
      message: timedOut ? 'Server membutuhkan waktu terlalu lama. Silakan coba lagi.' : 'Backend belum dapat dihubungi. Periksa deployment Apps Script dan coba lagi.'
    }, 502);
  }
}
