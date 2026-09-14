import type { Finding, FindingSeverity, FindingStatus } from '$lib/agent/types';

export function formatCvss(cvss: number | null | undefined): string {
  if (cvss == null || Number.isNaN(cvss)) return 'n/a';
  return cvss.toFixed(1);
}

export function findingConfirmed(status: string | undefined): boolean {
  return status === 'confirmed';
}

/** CSS custom property carrying the severity hue (Law 1: colour means risk). */
export function severityToken(s: FindingSeverity): string {
  switch (s) {
    case 'critical': return 'var(--sev-critical)';
    case 'high': return 'var(--sev-high)';
    case 'medium': return 'var(--sev-medium)';
    case 'low': return 'var(--sev-low)';
    case 'info': return 'var(--sev-info)';
    default: {
      const _n: never = s;
      return _n;
    }
  }
}

/**
 * Second, non-colour channel for severity. One distinct glyph per level so a
 * colour-blind reader (or a greyscale print of the report) still ranks rows at
 * a glance; the text label remains the channel screen readers use.
 */
export function severityShape(s: FindingSeverity): string {
  switch (s) {
    case 'critical': return '■';
    case 'high': return '▲';
    case 'medium': return '●';
    case 'low': return '◆';
    case 'info': return '○';
    default: {
      const _n: never = s;
      return _n;
    }
  }
}

export function parseSeverity(value: string | undefined): FindingSeverity {
  const v = (value || '').trim().toLowerCase();
  switch (v) {
    case 'critical':
    case 'high':
    case 'medium':
    case 'low':
    case 'info':
      return v;
    default:
      return 'info';
  }
}

export function parseStatus(value: string | undefined): FindingStatus {
  const v = (value || '').trim().toLowerCase().replace(/\s+/g, '_');
  switch (v) {
    case 'lead':
    case 'confirmed':
    case 'ruled_out':
      return v;
    default:
      return 'lead';
  }
}

export interface ListedFinding {
  id?: string;
  file?: string;
  title?: string;
  severity?: string;
  status?: string;
  body?: string;
  cvss?: number | string | null;
  evidence?: string;
  assessment?: string;
  remediation?: string;
  vector?: string;
}

function markdownSection(body: string, heading: string): string {
  const re = new RegExp(`##\\s*${heading}\\s*([\\s\\S]*?)(?=\\n##\\s+|$)`, 'i');
  return body.match(re)?.[1]?.trim() || '';
}

function markdownField(body: string, name: string): string {
  const re = new RegExp(`\\*\\*${name}\\*\\*\\s*:\\s*(.+)`, 'i');
  return body.match(re)?.[1]?.trim().replace(/^\*+|\*+$/g, '').trim() || '';
}

function parseCvss(raw: number | string | null | undefined): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw !== 'string') return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

export function fromListedFinding(raw: ListedFinding): Finding {
  const body = raw.body || '';
  const cvssField = raw.cvss ?? markdownField(body, 'CVSS');
  return {
    id: raw.id || raw.file || `finding-${raw.title || 'untitled'}`,
    title: raw.title || 'Finding',
    severity: parseSeverity(raw.severity || markdownField(body, 'Severity')),
    status: parseStatus(raw.status || markdownField(body, 'Status')),
    cvss: parseCvss(cvssField),
    vector: raw.vector || markdownField(body, 'Vector') || undefined,
    evidence: raw.evidence || markdownSection(body, 'Evidence'),
    assessment: raw.assessment || markdownSection(body, 'Description') || markdownSection(body, 'Assessment'),
    remediation: raw.remediation || markdownSection(body, 'Remediation'),
  };
}
