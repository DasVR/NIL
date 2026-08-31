---
name: nil-plugins
description: NIL plugin system — 4 types (tool, UI, model, workflow), hot-reload, marketplace-ready, sandboxed execution.
---

# NIL Plugin System — Extensible Architecture

## Plugin Types

| Type | Purpose | Examples |
|------|---------|----------|
| **Tool** | Execute commands, return structured data | nmap, nuclei, ffuf, git, docker, custom CLI |
| **UI** | Add components, panels, views | Custom inspector, dashboard, visualizer |
| **Model** | Add model providers, adapters | Local Ollama, LM Studio, custom OpenAI-compatible |
| **Workflow** | Multi-step automation, agent loops | Recon chain, report generator, CI pipeline |

## Plugin Manifest (package.json)

```json
{
  "name": "nil-plugin-nmap",
  "version": "1.0.0",
  "nil": {
    "type": "tool",
    "entry": "dist/index.js",
    "permissions": ["shell:exec", "fs:read"],
    "sandbox": "firejail",
    "provides": ["port_scan", "service_detection"],
    "configSchema": {
      "type": "object",
      "properties": {
        "timing": { "type": "string", "enum": ["T0", "T1", "T2", "T3", "T4", "T5"] }
      }
    }
  },
  "main": "dist/index.js",
  "scripts": { "build": "tsc", "dev": "tsx watch src/index.ts" }
}
```

## Plugin Interface (TypeScript)

```typescript
// plugins/types.ts
export interface Plugin {
  info: PluginInfo;
  execute(input: PluginInput): Promise<PluginOutput>;
  validateConfig(config: unknown): ConfigValidationResult;
  onLoad?(context: PluginContext): Promise<void>;
  onUnload?(): Promise<void>;
}

export interface PluginInfo {
  name: string;
  version: string;
  type: 'tool' | 'ui' | 'model' | 'workflow';
  description: string;
  author: string;
  permissions: Permission[];
  sandbox: 'none' | 'firejail' | 'docker' | 'wasm';
  provides: string[];  // capability IDs
  configSchema: JSONSchema;
}

export interface PluginInput {
  target: string;
  args: Record<string, unknown>;
  context: EngagementContext;
  credentials: CredentialRef[];
}

export interface PluginOutput {
  success: boolean;
  data: unknown;
  metadata: {
    durationMs: number;
    exitCode?: number;
    stdout?: string;
    stderr?: string;
    artifacts: ArtifactRef[];
  };
  findings?: Finding[];
}
```

## Sandbox Execution

| Sandbox | Use For | Overhead |
|---------|---------|----------|
| `none` | Safe, read-only tools | None |
| `firejail` | Local CLI tools (nmap, nuclei) | ~50ms |
| `docker` | Untrusted, network tools | ~200ms |
| `wasm` | Pure compute, parsers | ~5ms |

## Discovery & Loading

```typescript
// Plugin discovery
const PLUGIN_DIRS = [
  path.join(__dirname, 'plugins'),           // built-in
  path.join(homedir(), '.nil', 'plugins'),   // user drop-in
];

async function discoverPlugins(): Promise<Plugin[]> {
  const plugins: Plugin[] = [];
  for (const dir of PLUGIN_DIRS) {
    for (const file of await glob('**/package.json', { cwd: dir })) {
      const manifest = JSON.parse(await readFile(path.join(dir, file)));
      if (manifest.nil?.type) {
        const plugin = await import(path.join(dir, file, manifest.nil.entry));
        plugins.push(plugin.default);
      }
    }
  }
  return plugins;
}

// Hot reload
watch(PLUGIN_DIRS, () => reloadPlugins());
```

## UI Integration Points

```typescript
// UI plugins register components
export function registerUIComponents(app: App) {
  app.component('CustomInspector', CustomInspector);
  app.component('CustomDashboard', CustomDashboard);
  
  // Add to sidebar
  sidebar.registerSection('custom', {
    label: 'Custom',
    icon: 'cube',
    component: CustomSidebarSection,
  });
  
  // Add to command palette
  palette.registerCommands([
    { id: 'custom:action', label: 'Custom Action', shortcut: 'Cmd+Shift+C' },
  ]);
}
```

## Model Provider Plugin

```typescript
// plugins/model-adapter.ts
export interface ModelProvider {
  id: string;
  name: string;
  models: Model[];
  capabilities: ('chat' | 'completion' | 'embedding' | 'vision')[];
  
  // Required
  chat(request: ChatRequest): AsyncIterable<ChatResponse>;
  listModels(): Promise<Model[]>;
  
  // Optional
  embed?(texts: string[]): Promise<number[][]>;
  vision?(images: ImageInput[]): Promise<VisionResponse>;
}

// Register
modelRegistry.register('ollama', new OllamaProvider());
modelRegistry.register('lmstudio', new LMStudioProvider());
modelRegistry.register('openrouter', new OpenRouterProvider());
```

## Workflow Plugin (Agent Loops)

```typescript
// plugins/workflow.ts
export interface WorkflowPlugin {
  id: string;
  name: string;
  steps: WorkflowStep[];
  
  async execute(input: WorkflowInput, context: WorkflowContext): Promise<WorkflowOutput>;
}

export interface WorkflowStep {
  id: string;
  type: 'tool' | 'model' | 'condition' | 'parallel' | 'human';
  config: Record<string, unknown>;
  onSuccess?: string;  // next step ID
  onFailure?: string;
}

// Example: Recon workflow
const reconWorkflow: WorkflowPlugin = {
  id: 'recon-chain',
  name: 'Recon Chain',
  steps: [
    { id: 'nmap', type: 'tool', config: { plugin: 'nmap', args: { timing: 'T4' } } },
    { id: 'httpx', type: 'tool', config: { plugin: 'httpx' }, onSuccess: 'nuclei' },
    { id: 'nuclei', type: 'tool', config: { plugin: 'nuclei', args: { severity: ['critical', 'high'] } } },
  ],
};
```

## Marketplace (Future)

- `nil plugin publish` → pushes to registry
- `nil plugin install <name>` → downloads, verifies signature, installs
- Signed plugins only (ed25519)
- Sandbox policy enforced at install time

## Verification

```bash
# Plugin typecheck
cd plugins/nil-plugin-nmap && npx tsc --noEmit

# Sandbox test
nil plugin test nil-plugin-nmap --target=scanme.nmap.org

# Security audit
nil plugin audit nil-plugin-nmap
```