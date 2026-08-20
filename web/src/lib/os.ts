import catalog from '$lib/install-catalog.json';
import type { ReleaseAsset, GitHubRelease } from '$lib/releases';

export type HostOS = 'macos' | 'windows' | 'linux' | 'web';

export type InstallAssetSpec = {
  file: string;
  exts: string[];
  label: string;
  action: string;
};

export type InstallSystem = {
  id: HostOS;
  name: string;
  here: string;
  requirement: string;
  primary: InstallAssetSpec;
  also: InstallAssetSpec[];
  paths: { user: string; admin: string };
  first_launch: string[];
  headless: string;
};

export type InstallEra = {
  id: string;
  title: string;
  body: string;
};

type CatalogFile = {
  product: string;
  eras: InstallEra[];
  systems: Record<HostOS, InstallSystem>;
};

const DATA = catalog as CatalogFile;

export const INSTALL_ERAS: InstallEra[] = DATA.eras;
export const INSTALL_SYSTEMS = DATA.systems;
export const INSTALL_OS_ORDER: HostOS[] = ['macos', 'windows', 'linux', 'web'];

export function detectHostOS(): HostOS {
  if (typeof navigator === 'undefined') return 'web';
  const ua = navigator.userAgent;
  const plat = navigator.platform || '';
  if (/Mac|iPhone|iPad/i.test(plat) || /Mac OS X|Macintosh/.test(ua)) return 'macos';
  if (/Win/i.test(plat) || /Windows/.test(ua)) return 'windows';
  if (/Linux/.test(ua) || /Linux|X11/.test(plat)) return 'linux';
  return 'web';
}

export function systemFor(os: HostOS): InstallSystem {
  return INSTALL_SYSTEMS[os];
}

export function welcomeLine(os: HostOS): string {
  return `Welcome. Finn is on ${systemFor(os).here}.`;
}

function matchesSpec(name: string, spec: InstallAssetSpec): boolean {
  const lower = name.toLowerCase();
  if (spec.exts.some((ext) => lower.endsWith(ext))) {
    if (spec.exts.includes('.zip')) return /macos|darwin|\.app/i.test(name);
    return true;
  }
  return lower.includes(spec.file.toLowerCase());
}

export function preferredAsset(release: GitHubRelease | null, os: HostOS): ReleaseAsset | null {
  if (!release?.assets?.length) return null;
  const spec = systemFor(os);
  const ranked = [spec.primary, ...spec.also];
  for (const item of ranked) {
    const hit = release.assets.find((a) => matchesSpec(a.name, item));
    if (hit) return hit;
  }
  return release.assets[0] ?? null;
}

export function assetsForOS(release: GitHubRelease | null, os: HostOS): ReleaseAsset[] {
  if (!release?.assets?.length) return [];
  const spec = systemFor(os);
  const wanted = [spec.primary, ...spec.also];
  return release.assets.filter((a) => wanted.some((item) => matchesSpec(a.name, item)));
}

export function otherAssets(release: GitHubRelease | null, os: HostOS): ReleaseAsset[] {
  if (!release?.assets?.length) return [];
  const mine = new Set(assetsForOS(release, os).map((a) => a.url));
  return release.assets.filter((a) => !mine.has(a.url));
}
