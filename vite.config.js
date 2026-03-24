import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function anthropicProxyPlugin() {
  let apiKey;
  return {
    name: 'anthropic-proxy',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, '');
      apiKey = env.ANTHROPIC_API_KEY;
    },
    configureServer(server) {
      server.middlewares.use('/api/anthropic-proxy-background', async (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405);
          return res.end('Method Not Allowed');
        }
        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured in .env' }));
        }
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = Buffer.concat(chunks).toString();

        try {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
            body,
          });
          const data = await response.text();
          res.writeHead(response.status, { 'Content-Type': 'application/json' });
          res.end(data);
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Request failed. Please try again.' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), anthropicProxyPlugin()],
});
