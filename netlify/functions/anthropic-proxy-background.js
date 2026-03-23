const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';
const MAX_BODY_SIZE = 512 * 1024; // 512KB — accommodates Orchestrator context

exports.handler = async (event) => {
  // Method check
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Origin validation — reject requests not from the app's own domain
  const origin = event.headers['origin'] || event.headers['referer'] || '';
  if (ALLOWED_ORIGIN && !origin.startsWith(ALLOWED_ORIGIN)) {
    return { statusCode: 403, body: 'Forbidden' };
  }

  // Body size check
  const bodySize = Buffer.byteLength(event.body || '', 'utf8');
  if (bodySize > MAX_BODY_SIZE) {
    return { statusCode: 413, body: 'Request too large' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not configured');
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: event.body,
    });

    const data = await response.json();
    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Anthropic proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Request failed. Please try again.' }),
    };
  }
};
