const PROXY_URL = '/api/anthropic-proxy-background';
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 100; // ~5 minutes at 3s intervals

export async function callAgent(requestBody, signal) {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
    signal,
  });

  // Background functions return 202 immediately in production.
  // In local dev (netlify dev), the response comes back synchronously.
  if (response.status === 202) {
    // Production background function — poll for result
    return pollForResult(response, signal);
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorBody.error || `API error: ${response.status}`);
  }

  return response.json();
}

async function pollForResult(initialResponse, signal) {
  // For background functions, we'd need a separate polling endpoint.
  // In the current architecture (local dev), responses come back synchronously,
  // so this path is a placeholder for production deployment.
  // If we get a 202, try to parse the body — it may still contain data in some environments.
  const body = await initialResponse.text();
  if (body) {
    try {
      return JSON.parse(body);
    } catch (e) {
      // No parseable body — fall through to polling
    }
  }

  // Poll the status endpoint if available
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    if (signal?.aborted) throw new Error('Request cancelled');
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

    const pollResponse = await fetch(PROXY_URL, {
      method: 'OPTIONS',
      signal,
    });

    if (pollResponse.ok) {
      return pollResponse.json();
    }
  }

  throw new Error('Agent request timed out. Please try again.');
}
