<script lang="ts">
  import { agentRun } from '$lib/agent/run.svelte.ts';
  import { appState } from '$lib/stores/appState.svelte.ts';
  import { workspace } from '$lib/stores/workspace.svelte.ts';
  import { tabsStore } from '$lib/stores/tabsStore';
  import { project, gitCiLabel } from '$lib/project.svelte.ts';
  import SpendMeter from '$lib/components/ui/SpendMeter.svelte';
  import AgentGlyph from '$lib/components/ui/AgentGlyph.svelte';
  import { agentPhase } from '$lib/agent/phase';
  import { usageStore } from '$lib/usage/store.svelte.ts';
  import { shortcutGlyphs } from '$lib/shortcuts';

  let tabs = $derived($tabsStore);
  let activeTab = $derived(tabs.tabs.find(t => t.id === tabs.activeTabId));
  let backendStatus = $derived(appState.backendHealthy ? 'connected' : 'offline');
  let sessionLabel = $derived(workspace.sessionLabel);
  // One glyph for idle / thinking / editing / needs-you (AgentGlyph); the
  // running state keeps the SCANLINE word below, untouched.
  let phase = $derived(agentPhase());
</script>

<!--
  Four groups, one concern each. Items inside a group sit --s-2 apart with no
  rule between them; a hairline only ever separates two groups. Reading left
  to right: where am I (link + session) → what is the agent doing (phase +
  spend) … what am I looking at (git + tab) → what can I do (yolo + settings).
-->
<footer class="status-bar" role="status" aria-live="polite">
  <div class="side">
    <div class="group" aria-label="Connection and session">
      <span class="link">
        <span class="dot" class:ok={appState.backendHealthy}></span>
        <span>{backendStatus}</span>
      </span>
      <!-- sessionLabel doubles as an engagement id (a technical value — mono
           is right) and, with no engagement active, a plain fallback word
           ('pentest'/'build'/'nil' — an English state word, not data, so it
           should read like the plain workstationMode span beside it, not
           like a machine value). -->
      <span class:mono={Boolean(appState.activeEngagementId)}>{sessionLabel}</span>
      {#if sessionLabel !== workspace.workstationMode}
        <span>{workspace.workstationMode}</span>
      {/if}
    </div>

    <div class="group" aria-label="Agent activity">
      {#if phase === 'running'}
        <span class="nil-scan" data-state="working">running</span>
      {:else}
        <AgentGlyph label />
        {#if phase === 'needs-you' && agentRun.pendingApproval}
          <kbd>{shortcutGlyphs('Mod+Enter')}</kbd>
        {/if}
      {/if}
      <SpendMeter usage={usageStore.totals} compact />
    </div>
  </div>

  <div class="side">
    {#if project.git || activeTab}
      <div class="group" aria-label="Workspace">
        {#if project.git}
          <span class="git">
            <span class="mono">{project.git.branch}</span>
            {#if project.git.ci}
              <span class="mono">{gitCiLabel(project.git.ci)}</span>
            {/if}
          </span>
        {/if}
        {#if activeTab}
          <span class="mono">{activeTab.label}</span>
        {/if}
      </div>
    {/if}

    <div class="group actions" aria-label="Actions">
      {#if appState.yoloMode}
        <button class="ghost nil-halo" type="button" onclick={() => appState.toggleYolo()}>yolo</button>
      {/if}
      <button class="ghost nil-halo" type="button" onclick={() => appState.toggleSettings()} aria-label="Open settings">set</button>
    </div>
  </div>
</footer>

<style>
  .status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--statusbar-h);
    padding: 0 var(--s-3);
    background: var(--nil-panel);
    border-top: 1px solid var(--nil-line);
    font: var(--t-micro)/1 var(--font-ui);
    letter-spacing: var(--track-tick);
    text-transform: uppercase;
    color: var(--nil-ink-3);
    flex-shrink: 0;
  }

  /* Between groups: --s-4 either side of a hairline. Inside a group: --s-2 and
     no rule. The 4:1 spacing ratio is what makes the grouping legible; the
     hairline just confirms it. */
  .side {
    display: flex;
    align-items: center;
    gap: var(--s-4);
    min-width: 0;
  }

  .group {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    min-width: 0;
  }

  .group + .group::before {
    content: "";
    flex-shrink: 0;
    width: 1px;
    height: 10px;
    background: var(--nil-line);
    margin-right: var(--s-2);
  }

  /* Compound items: a dot and its word, a branch and its CI verdict. Tighter
     than the group gap so they read as one fact, not two. */
  .link,
  .git {
    display: inline-flex;
    align-items: center;
    gap: var(--s-1);
  }
  .git { gap: 6px; }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--nil-ink-4);
    flex-shrink: 0;
  }
  .dot.ok { background: var(--nil-ink-2); }

  .mono {
    font-family: var(--font-machine);
    text-transform: none;
    letter-spacing: var(--track-mono);
  }

  .actions .ghost {
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    cursor: pointer;
    padding: 0 4px;
  }
  .actions .ghost:hover { color: var(--nil-ink-2); }

  kbd {
    font: var(--t-micro)/1 var(--font-machine);
    text-transform: none;
  }
</style>
