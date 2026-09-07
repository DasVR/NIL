import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Set by github-pages.yml for the project-page subpath (dasvr.github.io/NIL/).
// Empty everywhere else (the pip-bundled webui and frontend-release.yml both
// serve from the domain root), so this must stay opt-in via env var. Validated
// (rather than just asserted) since SvelteKit's `paths.base` type requires
// either '' or a leading slash, and env vars are untyped strings.
const rawBasePath = process.env.BASE_PATH ?? '';
if (rawBasePath !== '' && !rawBasePath.startsWith('/')) {
  throw new Error(`BASE_PATH must start with "/" or be empty, got: ${JSON.stringify(rawBasePath)}`);
}
/** @type {'' | `/${string}`} */
const basePath = /** @type {any} */ (rawBasePath);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      fallback: 'index.html',
      strict: false,
    }),
    paths: {
      base: basePath,
    },
    alias: {
      $lib: './src/lib',
    },
  },
};

export default config;
