export type FindingSections = {
  description: string;
  evidence: string;
  remediation: string;
  cvss: string;
  date: string;
};

export function parseFindingBody(body: string): FindingSections {
  const sections: FindingSections = {
    description: '',
    evidence: '',
    remediation: '',
    cvss: 'n/a',
    date: ''
  };
  if (!body) return sections;
  for (const line of body.split('\n')) {
    const lower = line.toLowerCase();
    if (lower.startsWith('**cvss**')) sections.cvss = line.split(':').slice(1).join(':').trim();
    if (lower.startsWith('**date**')) sections.date = line.split(':').slice(1).join(':').trim();
  }
  const chunks = body.split(/^##\s+/m);
  for (const chunk of chunks) {
    const [title, ...rest] = chunk.split('\n');
    const key = title?.trim().toLowerCase();
    const text = rest.join('\n').trim();
    if (key === 'description') sections.description = text;
    if (key === 'evidence') sections.evidence = text;
    if (key === 'remediation') sections.remediation = text;
  }
  if (!sections.description) {
    sections.description = body.replace(/^#.*$/m, '').trim().slice(0, 1200);
  }
  return sections;
}

export const SEVERITY_COLOR: Record<string, string> = {
  critical: '#ff2d55',
  high: '#ff5c5c',
  medium: '#ffb454',
  low: '#5cb8ff',
  info: '#9a9a94'
};

export const SEVERITY_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0
};
