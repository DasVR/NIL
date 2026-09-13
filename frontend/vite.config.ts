import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { nilWorkspace } from './vite-plugin-nil-workspace';

export default defineConfig({
  plugins: [nilWorkspace(), sveltekit()],
  build: {
    target: 'esnext',
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['monaco-editor'],
  },
});
