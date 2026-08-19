/** Route a composer line to the agent vs the shell. */

const KNOWN_TOOLS = new Set([
  'nmap',
  'ncat',
  'nc',
  'nping',
  'nuclei',
  'ffuf',
  'gobuster',
  'curl',
  'wget',
  'python',
  'python3',
  'bash',
  'sh',
  'zsh',
  'ssh',
  'docker',
  'git',
  'ls',
  'cat',
  'find',
  'grep',
  'rg',
  'ping',
  'dig',
  'whois',
  'hydra',
  'nikto',
  'sqlmap',
  'masscan',
  'httpx',
  'subfinder',
  'jq',
  'awk',
  'sed',
  'tr',
  'head',
  'tail',
  'chmod',
  'chown',
  'cp',
  'mv',
  'rm',
  'touch',
  'mkdir',
  'tar',
  'unzip',
  'openssl',
  'make',
  'cargo',
  'npm',
  'pip',
  'apt',
  'apk',
  'brew'
]);

const CHAT_PREFIX =
  /^(please|pls|can you|could you|would you|will you|what|why|how|who|where|explain|draft|summarize|scan the|run a|help|tell me|i need|i want)\b/i;

function commandToken(raw: string): string {
  const tokens = raw.trim().split(/\s+/).filter(Boolean);
  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i];
    if (tok === 'sudo' || tok === 'doas') {
      i += 1;
      continue;
    }
    if (tok.includes('=') && !tok.startsWith('-')) {
      i += 1;
      continue;
    }
    break;
  }
  return (tokens[i] ?? '').replace(/^[./]+/, '').toLowerCase();
}

export function guessShellTool(text: string): string {
  return commandToken(text) || 'shell';
}

export function looksLikeCommand(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  const tool = commandToken(t);
  if (KNOWN_TOOLS.has(tool)) return true;
  if (tool.startsWith('nmap') || tool.startsWith('ffuf') || tool.startsWith('nuclei')) return true;
  if (t.startsWith('./') || t.startsWith('/') || t.startsWith('~/')) return true;
  if (t.includes('|') || t.includes('&&') || /;\s*\S/.test(t)) return true;
  return false;
}

export function looksLikeChat(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (t.startsWith('/ask') || t.startsWith('?') || t.startsWith('>')) return true;
  if (/\?$/.test(t)) return true;
  if (CHAT_PREFIX.test(t)) return true;
  if (looksLikeCommand(t)) return false;

  const words = t.split(/\s+/);
  if (words.length >= 4 && !/^[\w.-]+\s+-{1,2}\w/.test(t)) return true;
  return false;
}

export function isDockerDownError(text: string): boolean {
  const t = text || '';
  return (
    /docker is not running/i.test(t) ||
    /docker is not installed/i.test(t) ||
    /docker desktop did not become ready/i.test(t) ||
    /docker is not running or not accessible/i.test(t) ||
    /docker sandbox is off until you accept/i.test(t)
  );
}
