export async function checkApiHealth() {
  try {
    const response = await fetch('/api/anthropic-proxy-background', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    // Any response (even 400/500) means the function is reachable.
    // Only a network error or no response indicates a configuration problem.
    return true;
  } catch (e) {
    return false;
  }
}
