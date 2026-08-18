import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function renderMarkdown(text: string): string {
  const raw = marked.parse(text || '', { async: false }) as string;
  if (typeof window === 'undefined') return raw;
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [
      'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'pre', 'blockquote',
      'h1', 'h2', 'h3', 'h4', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'br', 'span'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  });
}

export type FinnBlock =
  | { type: 'text'; body: string }
  | { type: 'code'; lang: string; body: string };

export function splitFinnBlocks(content: string): FinnBlock[] {
  const parts = content.split(/```/);
  const blocks: FinnBlock[] = [];
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (i % 2 === 1) {
      const newline = part.indexOf('\n');
      const lang = newline === -1 ? '' : part.slice(0, newline).trim();
      const body = newline === -1 ? part : part.slice(newline + 1);
      blocks.push({ type: 'code', lang, body });
    } else if (part.trim()) {
      blocks.push({ type: 'text', body: part.trim() });
    }
  }
  return blocks;
}

export function extractCommands(text: string): string[] {
  const commands: string[] = [];
  const re = /```(?:bash|sh|shell|zsh)?\s*\n([\s\S]*?)```/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text || '')) !== null) {
    const first = match[1]
      .trim()
      .split('\n')
      .find((line) => line && !line.startsWith('#'));
    if (first) commands.push(first.trim());
  }
  return [...new Set(commands)];
}
