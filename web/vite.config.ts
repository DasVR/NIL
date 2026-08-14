import type { IncomingMessage, ServerResponse } from 'node:http';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';

function rewriteAppHtml(
  req: IncomingMessage,
  _res: ServerResponse,
  next: () => void
): void {
  const url = req.url ?? '';
  if (url === '/app.html' || url.startsWith('/app.html?')) {
    req.url = `/app${url.slice('/app.html'.length)}`;
  }
  next();
}

function appHtmlDevAlias(): Plugin {
  return {
    name: 'finn-app-html-dev-alias',
    configureServer(server) {
      server.middlewares.use(rewriteAppHtml);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewriteAppHtml);
    }
  };
}

export default defineConfig({
  plugins: [appHtmlDevAlias(), sveltekit()],
  server: {
    port: 5173,
    proxy: {
      '/v1': {
        target: 'http://127.0.0.1:8766',
        changeOrigin: true,
        ws: true
      }
    }
  }
});
