import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { nilWorkspace } from './vite-plugin-nil-workspace';

const apiProxy = {
  '/v1': {
    target: 'http://127.0.0.1:8766',
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [nilWorkspace(), sveltekit()],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
  build: {
    target: 'esnext',
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['monaco-editor'],
  },
});
