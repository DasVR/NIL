<script>
  import { marked } from 'marked';
  import { appState } from '$lib/stores.svelte';
  import TerminalPane from '$lib/components/TerminalPane.svelte';

  let draft = $state('');
  let editRun = $state(null);
  let editCmd = $state('');

  const modes = ['hunt', 'chat', 'code', 'report'];

  async function send() {
    const text = draft.trim();
    if (!text) return;
    draft = '';
    await appState.send(text);
  }

  function html(md) {
    return marked.parse(md || '', { async: false });
  }

  function onDrop(ev) {
    ev.preventDefault();
    const file = ev.dataTransfer?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      draft = `${draft}\n\n[uploaded ${file.name}]\n${String(reader.result).slice(0, 4000)}`;
    };
    reader.readAsText(file);
  }
</script>

<div class="chat" role="region" aria-label="Chat" ondragover={(e) => e.preventDefault()} ondrop={onDrop}>
  <header>
    <div class="modes">
      {#each modes as m}
        <button class:on={appState.mode === m} onclick={() => (appState.mode = m)}>{m}</button>
      {/each}
    </div>
  </header>

  <div class="thread">
    {#each appState.messages as msg}
      <article class={msg.role}>
        <div class="who">{msg.role}</div>
        {#if msg.role === 'assistant'}
          {@html html(msg.content)}
        {:else}
          <p>{msg.content}</p>
        {/if}
      </article>
    {/each}

    {#each appState.pending as run}
      <article class="approval">
        <div class="who">proposed {run.safety_level || 'safe'}</div>
        <pre>{run.command}</pre>
        {#if editRun === run.run_id}
          <input bind:value={editCmd} />
          <button class="primary" onclick={() => appState.approve(run.run_id, editCmd)}>Save & run</button>
        {:else}
          <button class="primary" onclick={() => appState.approve(run.run_id)}>Approve</button>
          <button class="danger" onclick={() => appState.reject(run.run_id)}>Reject</button>
          <button onclick={() => { editRun = run.run_id; editCmd = run.command; }}>Edit</button>
        {/if}
      </article>
    {/each}
  </div>

  <TerminalPane />

  <form class="composer" onsubmit={(e) => { e.preventDefault(); send(); }}>
    <textarea
      bind:value={draft}
      placeholder="Ask the copilot… drop a file here. Ctrl+Enter to send conceptually — Enter in this box + Send."
      rows="3"
    ></textarea>
    <button class="primary" type="submit" disabled={appState.busy}>Send</button>
  </form>
</div>

<style>
  .chat { display: flex; flex-direction: column; height: 100%; min-height: 0; }
  header { padding: 0.6rem 1rem; border-bottom: 1px solid #1c1c28; }
  .modes { display: flex; gap: 0.4rem; }
  .modes button.on { background: var(--accent); color: #050507; }
  .thread { flex: 1; overflow: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.8rem; }
  article { background: var(--navy); padding: 0.8rem 1rem; border-radius: 10px; max-width: 52rem; }
  article.user { align-self: flex-end; background: #12261f; }
  article.approval { border: 1px solid var(--warn); }
  .who { font-size: 0.7rem; color: var(--muted); text-transform: uppercase; margin-bottom: 0.3rem; }
  .composer { display: flex; gap: 0.6rem; padding: 0.8rem; border-top: 1px solid #1c1c28; }
  textarea { flex: 1; resize: none; }
  pre { white-space: pre-wrap; }
</style>
