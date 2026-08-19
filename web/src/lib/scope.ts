import type { Target } from './types';

const HOSTISH =
  /(?:(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?::\d{2,5})?(?:\/\S*)?|(?:\d{1,3}\.){3}\d{1,3}(?:\/\d{1,2})?)/gi;

export function parseScopeHosts(scope: string): string[] {
  const found = scope.match(HOSTISH) || [];
  const unique: string[] = [];
  for (const raw of found) {
    const host = raw.replace(/^[a-z]+:\/\//i, '').replace(/\/.*$/, '');
    if (host && !unique.includes(host)) unique.push(host);
  }
  return unique;
}

export function hostsToTargets(hosts: string[], extras: Target[] = []): Target[] {
  const byHost = new Map<string, Target>();
  for (const extra of extras) byHost.set(extra.host, extra);
  for (const host of hosts) {
    if (!byHost.has(host)) {
      byHost.set(host, {
        id: `scope-${host}`,
        host,
        ports: [],
        status: 'pending'
      });
    }
  }
  return [...byHost.values()];
}

export function loadExtraTargets(space: string): Target[] {
  try {
    const raw = localStorage.getItem(`finn.targets.${space}`);
    return raw ? (JSON.parse(raw) as Target[]) : [];
  } catch {
    return [];
  }
}

export function saveExtraTargets(space: string, targets: Target[]) {
  localStorage.setItem(
    `finn.targets.${space}`,
    JSON.stringify(targets.filter((t) => t.ports.length > 0 || !t.id.startsWith('scope-')))
  );
}
