export interface ClarifyOption {
  id: string;
  label: string;
}

export interface AgentClarify {
  title: string;
  options: ClarifyOption[];
  index: number;
  total: number;
}

function optionFrom(raw: unknown, index: number): ClarifyOption | null {
  if (typeof raw === 'string' && raw.trim()) {
    return { id: `opt-${index + 1}`, label: raw.trim() };
  }
  if (!raw || typeof raw !== 'object') return null;
  const rec = raw as Record<string, unknown>;
  const label = [rec.label, rec.text, rec.title].find((v) => typeof v === 'string' && v.trim());
  if (typeof label !== 'string') return null;
  const id = typeof rec.id === 'string' && rec.id.trim() ? rec.id.trim() : `opt-${index + 1}`;
  return { id, label: label.trim() };
}

export function clarifyFromPayload(raw: unknown): AgentClarify | null {
  if (!raw || typeof raw !== 'object') return null;
  const rec = raw as Record<string, unknown>;
  const title = typeof rec.title === 'string'
    ? rec.title.trim()
    : (typeof rec.question === 'string' ? rec.question.trim() : '');
  const list = Array.isArray(rec.options) ? rec.options : [];
  const options = list
    .map((row, i) => optionFrom(row, i))
    .filter((row): row is ClarifyOption => Boolean(row))
    .slice(0, 6);
  if (!title || options.length < 2) return null;
  const index = Number(rec.index);
  const total = Number(rec.total);
  return {
    title,
    options,
    index: Number.isFinite(index) && index > 0 ? index : 1,
    total: Number.isFinite(total) && total > 0 ? total : 1,
  };
}

const OPTION_LINE = /^\s*(?:(?:\d+)[.)]|[-*])\s+(.+)$/;

/** Numbered choices under a question — Claude's clarify shape, parsed from the reply. */
export function parseClarifyFromText(text: string): AgentClarify | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 1600 || trimmed.includes('```')) return null;
  const lines = trimmed.split('\n').map((line) => line.trim()).filter(Boolean);
  const options: string[] = [];
  let firstOpt = -1;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i]?.match(OPTION_LINE);
    if (match?.[1]) {
      if (firstOpt < 0) firstOpt = i;
      else if (options.length && i > firstOpt + options.length) break;
      options.push(match[1].trim());
      continue;
    }
    if (firstOpt >= 0) break;
  }
  if (options.length < 2 || options.length > 6 || firstOpt < 1) return null;
  const before = lines.slice(0, firstOpt);
  const title = [...before].reverse().find((line) => line.includes('?')) ?? before[before.length - 1] ?? '';
  if (!title.includes('?')) return null;
  return {
    title: title.replace(/^#+\s*/, ''),
    options: options.map((label, i) => ({ id: `opt-${i + 1}`, label })),
    index: 1,
    total: 1,
  };
}

/** Keep the question in the transcript; the card owns the numbered choices. */
export function transcriptForClarify(text: string, card: AgentClarify): string {
  const trimmed = text.trim();
  if (!trimmed) return card.title;
  const lines = trimmed.split('\n');
  let firstOpt = -1;
  for (let i = 0; i < lines.length; i++) {
    if (OPTION_LINE.test(lines[i] ?? '')) {
      firstOpt = i;
      break;
    }
  }
  if (firstOpt < 0) return trimmed;
  const before = lines.slice(0, firstOpt).join('\n').trim();
  return before || card.title;
}
