export type Engagement = {
  name: string;
  scope: string;
  notes: string;
  findings_count: number;
};

export type Plugin = {
  name: string;
  description: string;
  safety_level: string;
  tools: string[];
  category?: string;
};

export type Finding = {
  id: string;
  file: string;
  title: string;
  severity: string;
  body: string;
};

export type Target = {
  id: string;
  host: string;
  ip?: string;
  ports: number[];
  status: 'pending' | 'scanning' | 'done' | 'error';
};

export type PendingRun = {
  run_id: string;
  engagement: string;
  tool: string;
  command: string;
  safety_level?: string;
  status?: string;
  stdout?: string;
  stderr?: string;
  exit_code?: number | null;
  duration?: number;
  error?: string;
};

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  commands?: string[];
};

export type TermBlock = {
  id: string;
  command: string;
  tool: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'rejected';
  runId?: string;
  stdout: string;
  exitCode?: number | null;
  duration?: number;
  safetyLevel?: string;
  createdAt: number;
  collapsed: boolean;
};

export type InspectorTab = 'findings' | 'evidence' | 'timeline' | 'notes';
export type CenterView = 'terminal' | 'artifact' | 'split';
export type ChatMode = 'hunt' | 'chat' | 'code' | 'report';

export type SpaceLayout = {
  leftOpen: boolean;
  rightOpen: boolean;
  aiPinned: boolean;
  inspectorTab: InspectorTab;
  activeView: CenterView;
  selectedTargetId: string;
  selectedFindingId: string;
};

export type Artifact = {
  title: string;
  kind: 'markdown' | 'code';
  body: string;
  dirty: boolean;
};
