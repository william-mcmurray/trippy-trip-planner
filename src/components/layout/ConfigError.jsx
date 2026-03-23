import { useState } from 'react';
import { checkApiHealth } from '../../api/healthCheck';

export default function ConfigError({ onRetrySuccess }) {
  const [checking, setChecking] = useState(false);

  async function handleRetry() {
    setChecking(true);
    const healthy = await checkApiHealth();
    setChecking(false);
    if (healthy && onRetrySuccess) {
      onRetrySuccess();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-warm-800 mb-2">
          Unable to Connect
        </h2>
        <p className="text-warm-600 mb-6">
          Unable to connect to the AI service. Please check your configuration and try again.
        </p>
        <button
          onClick={handleRetry}
          disabled={checking}
          className="bg-terracotta-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-terracotta-600 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {checking ? 'Checking...' : 'Retry Connection'}
        </button>
      </div>
    </div>
  );
}
