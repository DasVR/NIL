export type TimelineRow = {
  id: string;
  timestamp: string;
  label: string;
  text: string;
};

const ROW_RE = /^\*\*\[(.+?)\]\*\*\s+`\[(.+?)\]`\s+(.*)$/;

export function parseTimeline(markdown: string): TimelineRow[] {
  if (!markdown || markdown.startsWith('No timeline')) return [];
  const rows: TimelineRow[] = [];
  for (const line of markdown.split('\n')) {
    const match = line.match(ROW_RE);
    if (!match) continue;
    rows.push({
      id: `${match[1]}-${rows.length}`,
      timestamp: match[1],
      label: match[2],
      text: match[3]
    });
  }
  return rows.reverse();
}
