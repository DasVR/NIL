import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      fallback: 'index.html',
      strict: false,
    }),
    paths: {
      // Set by github-pages.yml for the project-page subpath (dasvr.github.io/NIL/).
      // Empty everywhere else (the pip-bundled webui and frontend-release.yml both
      // serve from the domain root), so this must stay opt-in via env var.
      base: process.env.BASE_PATH ?? '',
    },
    alias: {
      $lib: './src/lib',
    },
  },
};

export default config;
