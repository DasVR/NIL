<script lang="ts">
  import { appState, pendingId } from '$lib/stores.svelte';
  import type { TermBlock } from '$lib/types';
  import { toast } from '$lib/toast.svelte';
  import { looksLikeChat, isDockerDownError } from '$lib/intent';

  let draft = $state('');
  let editId = $state('');
  let editCmd = $state('');

  const pendingBlocks = $derived(appState.blocks.filter((b) => b.status === 'pending'));
  const dockerBlocks = $derived(appState.blocks.filter((b) => isDockerDownError(b.stdout)));
  const dockerDown = $derived(
    (appState.runtime?.sandbox === 'docker' || appState.runtime?.sandbox_effective === 'docker') &&
      dockerBlocks.length > 0
  );
  const dockerRetry = $derived(
    [...dockerBlocks].reverse().find((b) => !looksLikeChat(b.command))?.command || ''
  );
  const rest = $derived(
    appState.blocks.filter((b) => b.status !== 'pending' && !isDockerDownError(b.stdout))
  );
  const asking = $derived(looksLikeChat(draft));

  function statusLabel(b: TermBlock): string {
    switch (b.status) {
      case 'pending':
        return 'pending';
      case 'running':
        return 'running';
      case 'success':
        return b.exitCode != null ? `exit ${b.exitCode}` : 'ok';
      case 'error':
        return 'error';
      case 'rejected':
        return 'rejected';
      default: {
        const _never: never = b.status;
        return _never;
      }
    }
  }

  async function submit() {
    const cmd = draft.trim();
    if (!cmd) return;
    draft = '';
    try {
      if (looksLikeChat(cmd)) {
        await appState.send(cmd);
        return;
      }
      await appState.proposeShell(cmd);
    } catch (err) {
      toast.show(err instanceof Error ? err.message : 'Command failed', 'danger');
    }
  }

  function onComposerKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      void submit();
    }
    if (e.key === 'ArrowUp' && !draft) {
      const prev = [...appState.blocks].reverse().find((b) => b.command);
      if (prev) draft = prev.command;
    }
  }

  function copy(text: string) {
    void navigator.clipboard.writeText(text);
    toast.show('Copied');
  }

  function ask(block: TermBlock) {
    appState.pinBlockForAgent(block);
  }
</script>

<section class="term" class:scan={appState.scanlines} aria-label="Block terminal">
  {#if pendingBlocks.length}
    <div class="rail" role="region" aria-label="Pending approval">
      {#each pendingBlocks as block (block.id)}
        <div class="block pending">
          <header>
            <span class="tool mono">{block.tool}</span>
            {#if editId === block.id}
              <input class="mono" bind:value={editCmd} />
            {:else}
              <span class="cmd mono">{block.command}</span>
            {/if}
            <span class="st">{statusLabel(block)}</span>
          </header>
          <div class="actions">
            {#if editId === block.id}
              <button type="button" class="primary" onclick={() => { void appState.approve(pendingId(block), editCmd); editId = ''; }}>Approve edited</button>
              <button type="button" onclick={() => (editId = '')}>Cancel</button>
            {:else}
              <button type="button" class="primary" onclick={() => appState.approve(pendingId(block))}>Approve ⌘↵</button>
              <button
                type="button"
                onclick={() => {
                  editId = block.id;
                  editCmd = block.command;
                }}>Edit</button
              >
              <button type="button" class="danger" onclick={() => appState.reject(pendingId(block))}>Reject</button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <div class="stream">
    {#if dockerDown}
      <div class="docker-banner" role="status">
        <p>Docker is not running. Switch to host sandbox in Setup, or start Docker Desktop.</p>
        {#if dockerRetry}
          <button type="button" class="banner-run" onclick={() => appState.proposeShell(dockerRetry)}>
            Re-run `{dockerRetry.slice(0, 48)}`
          </button>
        {/if}
      </div>
    {/if}
    {#if rest.length === 0 && pendingBlocks.length === 0 && !dockerDown}
      <p class="empty">
        {appState.scope.trim()
          ? `Scope loaded · ${appState.targets.length} hosts · press ⌘K to scan`
          : 'Type a command, or ⌘K to run a plugin against the active host.'}
      </p>
    {/if}
    {#each rest as block (block.id)}
      <article class="block" class:error={block.status === 'error'} class:rejected={block.status === 'rejected'}>
        <header>
          <button type="button" class="fold" onclick={() => appState.toggleBlock(block.id)}>{block.collapsed ? '▸' : '▾'}</button>
          <span class="tool mono">{block.tool}</span>
          <span class="cmd mono">{block.command}</span>
          <span class="st" class:ok={block.status === 'success'} class:bad={block.status === 'error'}>{statusLabel(block)}</span>
          {#if block.duration != null}<span class="dur mono">{block.duration.toFixed(1)}s</span>{/if}
        </header>
        {#if !block.collapsed}
          <pre class="out mono">{block.stdout || (block.status === 'running' ? 'running…' : '')}</pre>
          <div class="actions">
            <button type="button" onclick={() => copy(block.stdout || block.command)}>Copy</button>
            <button type="button" onclick={() => ask(block)}>Add to Finn</button>
            <button type="button" onclick={() => appState.bookmarkBlock(block)}>Save as evidence</button>
            <button type="button" onclick={() => appState.proposeShell(block.command)}>Re-run</button>
          </div>
        {/if}
      </article>
    {/each}
  </div>

  <form class="composer" onsubmit={(e) => { e.preventDefault(); void submit(); }}>
    <span class="prompt mono">{asking ? '›' : '$'}</span>
    <textarea
      class="mono"
      rows="1"
      data-composer="shell"
      bind:value={draft}
      placeholder={asking
        ? 'Ask Finn — Enter sends to the agent'
        : appState.yolo
          ? 'shell command — English goes to Finn'
          : 'shell command — questions go to Finn · Enter proposes'}
      onkeydown={onComposerKey}
    ></textarea>
    <button type="submit" class="go" disabled={!draft.trim()}>{asking ? 'Ask Finn' : 'Run'}</button>
  </form>
</section>

<style>
  .term {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: var(--abyss);
    position: relative;
  }
  .term.scan::after {
    content: "";
    pointer-events: none;
    position: absolute;
    inset: 0;
    z-index: 2;
    background: repeating-linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.02),
      rgba(255, 255, 255, 0.02) 1px,
      transparent 1px,
      transparent 3px
    );
  }
  .rail {
    flex-shrink: 0;
    padding: 8px;
    border-bottom: 1px solid rgba(255, 180, 84, 0.35);
    background: var(--warning-soft);
  }
  .stream {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 8px 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .empty {
    margin: 24px 8px;
    color: var(--text-faint);
    font-size: 13px;
  }
  .docker-banner {
    margin: 4px 0 8px;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid rgba(255, 92, 92, 0.35);
    background: var(--danger-soft);
    color: var(--danger);
    font-size: 12px;
    line-height: 1.4;
  }
  .docker-banner p { margin: 0 0 8px; }
  .banner-run {
    height: 24px;
    min-height: unset;
    font-size: 11px;
    padding: 0 8px;
  }
  .block {
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    background: var(--abyss-2);
    overflow: hidden;
  }
  .block.pending {
    border-color: rgba(255, 180, 84, 0.55);
    box-shadow: 0 0 0 1px rgba(255, 180, 84, 0.25);
  }
  .block.error { border-color: rgba(255, 92, 92, 0.4); }
  .block.rejected { opacity: 0.65; }
  header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    min-height: 28px;
  }
  .fold {
    width: 18px; height: 18px; padding: 0; min-height: unset;
    border: 0; background: transparent; color: var(--text-faint);
  }
  .tool { color: var(--green); font-size: 11px; }
  .cmd { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
  .st { font-size: 10px; color: var(--warning); text-transform: uppercase; letter-spacing: 0.04em; }
  .st.ok { color: var(--green); }
  .st.bad { color: var(--danger); }
  .dur { font-size: 10px; color: var(--text-faint); }
  .out {
    margin: 0;
    padding: 8px 12px 10px;
    font-size: 12px;
    line-height: 1.45;
    color: var(--text-dim);
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 280px;
    overflow: auto;
    background: var(--abyss);
  }
  .actions {
    display: flex;
    gap: 6px;
    padding: 6px 10px 8px;
    flex-wrap: wrap;
  }
  .actions button {
    height: 24px;
    min-height: unset;
    font-size: 11px;
    padding: 0 8px;
  }
  .composer {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 8px 10px;
    border-top: 1px solid var(--glass-border);
    background: var(--abyss-1);
  }
  .prompt { color: var(--green); padding-bottom: 8px; }
  .composer textarea {
    flex: 1;
    min-height: 32px;
    max-height: 120px;
    resize: none;
    font-size: 13px;
  }
  .go { min-height: 32px; }
</style>
