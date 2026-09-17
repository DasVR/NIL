<script lang="ts">
  import '$lib/styles/tokens.css';
  import '$lib/styles/motion.css';
  import '../app.css';
  import { onMount, untrack, type Snippet } from 'svelte';
  import { durToken, easeOut, reducedMotion } from '$lib/motion/tokens';
  import Titlebar from '$lib/components/shell/Titlebar.svelte';
  import Sidebar from '$lib/components/shell/Sidebar.svelte';
  import MainWorkspace from '$lib/components/shell/MainWorkspace.svelte';
  import RightSidebar from '$lib/components/shell/RightSidebar.svelte';
  import StreamComposer from '$lib/components/shell/StreamComposer.svelte';
  import ToolDock from '$lib/components/shell/ToolDock.svelte';
  import { workspace } from '$lib/stores/workspace.svelte.ts';
  import StatusBar from '$lib/components/shell/StatusBar.svelte';
  import CommandPalette from '$lib/components/shell/CommandPalette.svelte';
  import SettingsSheet from '$lib/components/shell/SettingsSheet.svelte';
  import GrainOverlay from '$lib/components/shell/GrainOverlay.svelte';
  import ColdOpen from '$lib/gl/ColdOpen.svelte';
  import { appState } from '$lib/stores/appState.svelte.ts';
  import { paletteStore } from '$lib/stores/paletteStore.svelte.ts';
  import { soundStore } from '$lib/stores/soundStore.svelte.ts';
  import { setupTauriEvents } from '$lib/tauri-events';
  import { keymap } from '$lib/keymap.svelte.ts';
  import { browser, dev } from '$app/environment';
  import { Agentation } from 'sv-agentation';
  import { agentRun, toolFilePath } from '$lib/agent/run.svelte.ts';
  import { usageStore } from '$lib/usage/store.svelte.ts';
  import { refreshProject } from '$lib/project.svelte.ts';
  import { connectBus } from '$lib/agent/bus';
  import ReportCover from '$lib/components/shell/ReportCover.svelte';
  import AgentRunBar from '$lib/components/ui/AgentRunBar.svelte';

  let { children }: { children: Snippet } = $props();

  let booted = $state(false);
  let composerInput: HTMLTextAreaElement | undefined = $state();

  // Empty -> stream handoff: the command deck settles into place as the empty
  // cluster gives way, so the transition reads as one orchestrated move rather
  // than a hard cut. One --dur-stage beat, opacity + transform only, and it
  // collapses to a plain appear under reduced motion.
  function deckSettle(_node: HTMLElement) {
    const reduced = reducedMotion();
    return {
      duration: reduced ? 0 : durToken('--dur-stage', 420),
      easing: easeOut,
      css: (t: number) =>
        `opacity: ${t};${reduced ? '' : ` transform: translateY(${(1 - t) * 8}px);`}`,
    };
  }

  onMount(() => {
    setupTauriEvents();
    keymap.init();
    soundStore.init();
    appState.setComposerFocus(() => composerInput?.focus());
    void refreshProject();
    void workspace.refreshModels();
  });

  $effect(() => {
    if (!browser) return;
    void usageStore.refresh(appState.activeEngagementId);
  });

  $effect(() => {
    if (!browser) return;
    const runningTool = agentRun.steps.find((s) => s.kind === 'tool' && s.state === 'running');
    const current = untrack(() => workspace.dock);
    if (runningTool && runningTool.kind === 'tool') {
      if (current?.id === 'terminal' && current.kind === 'terminal') return;
      const output = runningTool.output || runningTool.primaryArg;
      untrack(() => {
        if (current?.id === runningTool.id) {
          if (current.output !== output || current.status !== 'running') {
            workspace.updateDock({ output, status: 'running' });
          }
          return;
        }
        workspace.openDock({
          id: runningTool.id,
          title: runningTool.name,
          kind: workspace.classifyDock(runningTool.name),
          status: 'running',
          output,
          path: toolFilePath(runningTool) ?? undefined,
        });
      });
      return;
    }
    if (current && current.kind !== 'terminal' && current.status === 'running') {
      untrack(() => workspace.updateDock({ status: 'ok' }));
    }
  });

  $effect(() => {
    if (!browser) return;
    const id = appState.activeEngagementId;
    connectBus(id || 'default');
    if (id) void agentRun.loadEngagement(id);
  });
</script>

<svelte:window onkeydown={keymap.handleKeydown} />

<div class="app-shell" class:streaming={agentRun.running}>
  <GrainOverlay />
  <a class="skip-link" href="#workspace">Skip to workspace</a>
  <Titlebar />

  <div class="workbench">
    <Sidebar
      open={appState.sidebarOpen}
      width={appState.sidebarWidth}
      onToggle={() => workspace.togglePin()}
      onResize={(w) => appState.sidebarWidth = w}
    />

    <main id="workspace" class="workspace" tabindex="-1">
      <MainWorkspace>
        {#snippet emptyState()}
          {@render children()}
        {/snippet}
      </MainWorkspace>
      <ToolDock />
      <AgentRunBar />
      {#if workspace.sessionStarted}
        <div class="composer-mount" in:deckSettle>
          <StreamComposer bind:inputEl={composerInput} />
        </div>
      {/if}
    </main>

    <RightSidebar
      open={appState.rightSidebarOpen}
      width={appState.rightSidebarWidth}
      onToggle={() => appState.rightSidebarOpen = !appState.rightSidebarOpen}
      onResize={(w) => appState.rightSidebarWidth = w}
    />
  </div>

  <StatusBar />

  <CommandPalette open={paletteStore.open} onToggle={(o) => paletteStore.open = o} />
  <SettingsSheet open={appState.settingsOpen} onToggle={(o) => appState.settingsOpen = o} />
  <ReportCover />
</div>

{#if browser && !booted}
  <ColdOpen onbooted={() => (booted = true)} />
{/if}

<!-- Svelte Agentation: click an element, annotate it, copy structured
     markdown (with a source-file jump when VITE_WORKSPACE_ROOT is set) for
     handing straight to a coding session — this one, Cursor, or anyone else
     driving the UI rebuild. On by default in dev. Also on in a production
     build ONLY when VITE_ENABLE_AGENTATION=true was set at build time — the
     GitHub Pages workflow sets it (that deploy exists purely for UI review),
     the actual downloadable-release workflow (frontend-release.yml) does
     not, so a real release never ships the inspector. Both `dev` and
     import.meta.env reads are compile-time constants Vite inlines, so when
     neither condition holds this whole branch (and the import) is
     dead-code-eliminated from that build, not just hidden at runtime. -->
{#if browser && (dev || import.meta.env.VITE_ENABLE_AGENTATION === 'true')}
  <Agentation
    workspaceRoot={import.meta.env.VITE_WORKSPACE_ROOT ?? null}
    openSourceOnClick
  />
{/if}

<style>
  .app-shell {
    position: relative;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--nil-void);
    color: var(--nil-ink);
    font-family: var(--font-ui);
    border-radius: var(--r-window);
  }

  .workbench {
    flex: 1;
    display: flex;
    flex-direction: row;
    overflow: hidden;
    min-height: 0;
    padding: var(--s-2);
    gap: var(--s-2);
  }

  .workspace {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
    min-height: 0;
    gap: var(--s-2);
  }

  /* Wrapper exists only to carry the handoff settle; it must not change the
     deck's layout, so it never shrinks and passes width straight through. */
  .composer-mount {
    flex-shrink: 0;
  }
</style>
