// Vigil CORS Proxy — deploy this on Cloudflare Workers (free tier).
// It forwards requests to Twelve Data and adds the CORS header that
// lets your browser call it directly. No API key is stored here —
// your key still comes from the Vigil app itself, this just relays it.

export default {
  async fetch(request) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const incoming = new URL(request.url);
    const targetUrl = 'https://api.twelvedata.com' + incoming.pathname + incoming.search;

    try {
      const upstream = await fetch(targetUrl);
      const body = await upstream.text();
      return new Response(body, {
        status: upstream.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Proxy fetch failed', detail: String(e) }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
