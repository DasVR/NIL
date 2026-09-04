export type ToolState = 'pending' | 'running' | 'ok' | 'error';

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface ToolStep {
  kind: 'tool';
  id: string;
  index: number;
  name: string;
  primaryArg: string;
  args: unknown;
  state: ToolState;
  output?: string;
  error?: string;
  exitCode?: number;
  startTime?: number;
  endTime?: number;
}

export interface MessageStep {
  kind: 'message';
  id: string;
  role: 'user' | 'assistant';
  text: string;
  interrupted?: boolean;
}

export interface ThoughtStep {
  kind: 'thought';
  id: string;
  text: string;
}

export interface FindingStep {
  kind: 'finding';
  id: string;
  title: string;
  severity: FindingSeverity;
  cvss: number;
  vector?: string;
  evidence: string;
  assessment: string;
  remediation: string;
}

export type Step = ToolStep | MessageStep | ThoughtStep | FindingStep;

export interface Finding {
  id: string;
  title: string;
  severity: FindingSeverity;
  cvss: number;
  vector?: string;
  evidence: string;
  assessment: string;
  remediation: string;
}
