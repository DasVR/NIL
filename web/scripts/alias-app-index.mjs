import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const buildDir = join(root, '..', 'build');
const source = join(buildDir, 'app.html');
const dest = join(buildDir, 'app', 'index.html');

if (!existsSync(source)) {
  throw new Error(`Missing ${source}; SvelteKit did not prerender /app`);
}

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(source, dest);
