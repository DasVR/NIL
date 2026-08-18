export const GITHUB_REPO = 'DasVR/finn-pentest-harness';
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`;
export const GITHUB_RELEASES_URL = `${GITHUB_REPO_URL}/releases`;

export type ReleaseAsset = {
  name: string;
  label: string;
  platform: string;
  url: string;
  size: number;
};

export type GitHubRelease = {
  tag: string;
  name: string;
  publishedAt: string;
  htmlUrl: string;
  body: string;
  prerelease: boolean;
  assets: ReleaseAsset[];
};

type GitHubAsset = {
  name: string;
  browser_download_url: string;
  size: number;
};

type GitHubReleaseResponse = {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  body: string;
  prerelease: boolean;
  assets: GitHubAsset[];
};

function assetMeta(name: string): { label: string; platform: string } {
  const lower = name.toLowerCase();
  if (lower.endsWith('.zip') && /macos|darwin|\.app/i.test(lower)) {
    return { label: 'macOS kit (.app + .dmg + API)', platform: 'macOS 12+ — unzip, then install or open' };
  }
  if (lower.endsWith('.dmg')) return { label: 'macOS (DMG)', platform: 'macOS 12+' };
  if (lower.endsWith('.exe')) return { label: 'Windows', platform: 'Windows 10+' };
  if (lower.endsWith('.msi')) return { label: 'Windows (MSI)', platform: 'Windows 10+' };
  if (lower.endsWith('.appimage')) return { label: 'Linux', platform: 'Linux x86_64' };
  if (lower.endsWith('.deb')) return { label: 'Linux (deb)', platform: 'Debian/Ubuntu' };
  if (lower.endsWith('.whl')) return { label: 'Python wheel', platform: 'API (all OS)' };
  if (lower.includes('finn-install') && lower.endsWith('.sh')) {
    return { label: 'POSIX installer', platform: 'macOS / Linux' };
  }
  if (lower.includes('finn-install') && lower.endsWith('.ps1')) {
    return { label: 'Windows installer', platform: 'Windows' };
  }
  return { label: name, platform: 'Download' };
}

function mapRelease(raw: GitHubReleaseResponse): GitHubRelease {
  const assets = (raw.assets || [])
    .filter((a) => !a.name.endsWith('.sig') && !a.name.endsWith('.blockmap'))
    .map((a) => {
      const meta = assetMeta(a.name);
      return {
        name: a.name,
        label: meta.label,
        platform: meta.platform,
        url: a.browser_download_url,
        size: a.size
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return {
    tag: raw.tag_name,
    name: raw.name || raw.tag_name,
    publishedAt: raw.published_at,
    htmlUrl: raw.html_url,
    body: raw.body || '',
    prerelease: raw.prerelease,
    assets
  };
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function formatReleaseDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export async function fetchLatestRelease(): Promise<GitHubRelease | null> {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub releases API: ${res.status}`);
  return mapRelease(await res.json());
}

export async function fetchRecentReleases(limit = 6): Promise<GitHubRelease[]> {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=${limit}`);
  if (!res.ok) throw new Error(`GitHub releases API: ${res.status}`);
  const data: GitHubReleaseResponse[] = await res.json();
  return data.map(mapRelease);
}
