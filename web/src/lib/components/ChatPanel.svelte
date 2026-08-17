<script>
  import { pentestChat, streamPentestChat, approve, reject, apiPost } from '$lib/api';
  import { appState } from '$lib/stores.svelte';
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';

  const modes = ['hunt', 'chat', 'code', 'report'];
  const quickActions = [
    { label: 'Scan target', text: 'Scan the primary target in scope and summarize findings.' },
    { label: 'Run nmap', text: 'Run nmap -sV -sC against the in-scope target.' },
    { label: 'Draft report', text: 'Draft an executive summary report for this engagement.' },
    { label: 'Explain finding', text: 'Explain the most critical finding and remediation steps.' }
  ];
  const followUpChips = [
    { label: 'Run it', text: 'Run the proposed command now.' },
    { label: 'Explain more', text: 'Explain that in more detail.' },
    { label: 'Save to findings', text: 'Save this as a finding with severity and remediation.' },
    { label: 'Try another target', text: 'Suggest another in-scope target to test.' }
  ];

  let inputText = $state('');
  let messages = $state([]);
  let isStreaming = $state(false);
  let currentStreamText = $state('');
  let currentMeta = $state(null);
  let chatContainer;
  let composerTextarea;
  let abortFn = $state(null);
  let stickToBottom = $state(true);
  let composerFocused = $state(false);
  /** @type {Record<string, 'idle' | 'running' | 'success' | 'error' | 'rejected'>} */
  let commandStates = $state({});

  const isEmpty = $derived(messages.length === 0 && !isStreaming);

  function extractCommands(text) {
    const commands = [];
    const re = /```(?:bash|sh|shell|zsh)?\s*\n([\s\S]*?)```/gi;
    let match;
    while ((match = re.exec(text || '')) !== null) {
      const first = match[1].trim().split('\n').find((line) => line && !line.startsWith('#'));
      if (first) commands.push(first.trim());
    }
    return [...new Set(commands)];
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function enhanceMarkdownHtml(html) {
    return html.replace(
      /<pre><code(?: class="language-([^"]*)")?>([\s\S]*?)<\/code><\/pre>/gi,
      (_full, lang, code) => {
        const language = (lang || 'text').toLowerCase();
        const raw = code
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"');
        const encoded = escapeHtml(raw);
        return `<div class="artifact-card" data-lang="${language}">
          <div class="artifact-header">
            <span class="artifact-lang">${language}</span>
            <button type="button" class="artifact-copy" data-copy="${encoded}" aria-label="Copy code">Copy</button>
          </div>
          <pre><code class="language-${language}">${code}</code></pre>
        </div>`;
      }
    );
  }

  function renderMarkdown(text) {
    const raw = marked.parse(text || '', { async: false });
    const sanitized = DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: [
        'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'pre', 'blockquote',
        'h1', 'h2', 'h3', 'h4', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'br', 'span',
        'div', 'button'
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'type', 'aria-label', 'data-copy', 'data-lang']
    });
    return enhanceMarkdownHtml(sanitized);
  }

  function commandKey(msgIndex, cmdIndex, cmd) {
    return `${msgIndex}-${cmdIndex}-${cmd}`;
  }

  function scrollToBottom() {
    if (chatContainer && stickToBottom) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  $effect(() => {
    messages.length;
    currentStreamText;
    stickToBottom;
    scrollToBottom();
  });

  $effect(() => {
    if (!composerTextarea) return;
    composerTextarea.style.height = 'auto';
    const lineHeight = 22;
    const maxHeight = lineHeight * 8 + 16;
    composerTextarea.style.height = `${Math.min(composerTextarea.scrollHeight, maxHeight)}px`;
  });

  function onScroll() {
    if (!chatContainer) return;
    const near = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 80;
    stickToBottom = near;
  }

  function resizeComposer() {
    if (!composerTextarea) return;
    composerTextarea.style.height = 'auto';
    const lineHeight = 22;
    const maxHeight = lineHeight * 8 + 16;
    composerTextarea.style.height = `${Math.min(composerTextarea.scrollHeight, maxHeight)}px`;
  }

  async function handleSubmit() {
    if (!inputText.trim() || isStreaming) return;
    const text = inputText.trim();
    inputText = '';
    resizeComposer();
    messages = [...messages, { role: 'user', content: text }];
    isStreaming = true;
    currentStreamText = '';
    currentMeta = null;
    stickToBottom = true;

    abortFn = streamPentestChat(
      { engagement: appState.engagement, message: text, mode: appState.mode, yolo: appState.yolo },
      (chunk) => {
        if (chunk.type === 'text' && chunk.content) {
          currentStreamText += chunk.content;
        } else if (chunk.type === 'score' && chunk.score) {
          currentMeta = { ...currentMeta, score_breakdown: chunk.score };
        } else if (chunk.type === 'done') {
          finishStream();
        } else if (chunk.type === 'error') {
          isStreaming = false;
          messages = [...messages, { role: 'assistant', content: `Error: ${chunk.error || 'Unknown'}` }];
          cleanupStream();
        }
      },
      (err) => {
        isStreaming = false;
        messages = [...messages, { role: 'assistant', content: `Error: ${err.message}` }];
        cleanupStream();
      }
    );
  }

  function finishStream() {
    isStreaming = false;
    const commands = extractCommands(currentStreamText);
    const meta = {
      ...currentMeta,
      commands,
      score: currentMeta?.score_breakdown?.total,
      is_refusal: currentMeta?.is_refusal ?? false,
      template_used: currentMeta?.template_used
    };
    messages = [...messages, { role: 'assistant', content: currentStreamText, meta }];
    cleanupStream();
  }

  function cleanupStream() {
    abortFn = null;
    currentStreamText = '';
    currentMeta = null;
  }

  function cancelStream() {
    if (abortFn) abortFn();
    if (currentStreamText.trim()) {
      messages = [
        ...messages,
        { role: 'assistant', content: currentStreamText, meta: { commands: extractCommands(currentStreamText) } }
      ];
    }
    cleanupStream();
    isStreaming = false;
  }

  function handleKeydown(e) {
    const mod = e.metaKey || e.ctrlKey;
    if (e.key === 'Enter' && (mod || !e.shiftKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function copy(text) {
    navigator.clipboard.writeText(text);
  }

  function useCommand(cmd) {
    inputText = cmd;
    composerTextarea?.focus();
    resizeComposer();
  }

  function useQuickAction(text) {
    inputText = text;
    composerTextarea?.focus();
    resizeComposer();
  }

  function handleMarkdownClick(e) {
    const btn = e.target.closest('.artifact-copy');
    if (!btn) return;
    e.preventDefault();
    const encoded = btn.getAttribute('data-copy') || '';
    const raw = encoded
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"');
    copy(raw);
  }

  async function resolvePendingRun(command) {
    await appState.refresh();
    return appState.pending.find(
      (run) => run.command === command || run.command.trim() === command.trim()
    );
  }

  async function handleCommandApprove(cmd, key) {
    commandStates = { ...commandStates, [key]: 'running' };
    try {
      let run = await resolvePendingRun(cmd);
      if (!run) {
        const proposed = await apiPost('/v1/tools/propose', {
          engagement: appState.engagement,
          tool: 'shell',
          command: cmd
        });
        await appState.refresh();
        run = appState.pending.find((r) => r.run_id === proposed.run_id) || proposed;
      }
      await approve(run.run_id);
      const executed = await apiPost('/v1/tools/execute', { run_id: run.run_id });
      if (executed.stdout) {
        appState.termLines = [...appState.termLines, `$ ${executed.command}`, executed.stdout];
      }
      await appState.refresh();
      commandStates = { ...commandStates, [key]: executed.status === 'failed' ? 'error' : 'success' };
    } catch {
      commandStates = { ...commandStates, [key]: 'error' };
    }
  }

  async function handleCommandReject(cmd, key) {
    commandStates = { ...commandStates, [key]: 'running' };
    try {
      const run = await resolvePendingRun(cmd);
      if (run) {
        await reject(run.run_id);
        await appState.refresh();
      }
      commandStates = { ...commandStates, [key]: 'rejected' };
    } catch {
      commandStates = { ...commandStates, [key]: 'error' };
    }
  }

  async function toggleYolo() {
    await appState.toggleYolo();
  }

  function onDrop(ev) {
    ev.preventDefault();
    const file = ev.dataTransfer?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      inputText = `${inputText}\n\n[uploaded ${file.name}]\n${String(reader.result).slice(0, 4000)}`;
      resizeComposer();
    };
    reader.readAsText(file);
  }
</script>

<section class="chat-panel" role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation">
  <div
    class="messages"
    role="region"
    aria-label="Message history"
    bind:this={chatContainer}
    onscroll={onScroll}
    ondragover={(e) => e.preventDefault()}
    ondrop={onDrop}
  >
    <div class="messages-inner">
      {#if isEmpty}
        <div class="empty-state">
          <div class="empty-mark" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="currentColor" stroke-width="1.5" />
              <path d="M12 12l9-5M12 12L3 7M12 12v10" stroke="currentColor" stroke-width="1.5" opacity="0.5" />
            </svg>
          </div>
          <h2 class="empty-title">Finn Pentest Harness</h2>
          <p class="empty-sub">
            Engagement <span class="engagement-tag">{appState.engagement}</span>
          </p>
          <p class="empty-hint">Ask anything about your scope, run tools, or draft reports.</p>
        </div>
      {/if}

      {#each messages as msg, i (i)}
        {#if msg.role === 'user'}
          <article class="message user" aria-label="user message">
            <div class="user-pill">{msg.content}</div>
          </article>
        {:else}
          <article class="message assistant" aria-label="assistant message">
            <div class="assistant-row">
              <div class="assistant-avatar" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  <circle cx="9" cy="10" r="1" fill="currentColor" />
                  <circle cx="15" cy="10" r="1" fill="currentColor" />
                </svg>
              </div>
              <div class="assistant-content">
                <div class="assistant-body" role="group" onclick={handleMarkdownClick} onkeydown={(e) => e.key === 'Enter' && handleMarkdownClick(e)}>
                  {@html renderMarkdown(msg.content)}
                </div>

                {#if msg.meta}
                  <div class="meta">
                    {#if msg.meta.score}
                      <span class="score">Score {msg.meta.score}/100</span>
                    {/if}
                    {#if msg.meta.score_breakdown}
                      <span class="breakdown">
                        Q{msg.meta.score_breakdown.quality} F{msg.meta.score_breakdown.filteredness} S{msg.meta.score_breakdown.speed}
                      </span>
                    {/if}
                    {#if msg.meta.is_refusal}
                      <span class="badge refusal">⚠ REFUSAL</span>
                    {:else if msg.meta.score !== undefined || msg.meta.score_breakdown}
                      <span class="badge compliant">✓ COMPLIANT</span>
                    {/if}
                    {#if msg.meta.template_used}
                      <span class="template">T:{msg.meta.template_used}</span>
                    {/if}
                    <button class="copy-msg" onclick={() => copy(msg.content)} aria-label="Copy message">Copy</button>
                  </div>

                  {#if msg.meta.commands?.length}
                    <div class="tool-cards">
                      {#each msg.meta.commands as cmd, ci}
                        {@const key = commandKey(i, ci, cmd)}
                        {@const state = commandStates[key] || 'idle'}
                        <div class="tool-card" class:running={state === 'running'} class:success={state === 'success'} class:error={state === 'error'} class:rejected={state === 'rejected'}>
                          <button type="button" class="tool-preview" onclick={() => useCommand(cmd)} aria-label="Use command in composer">
                            <span class="tool-label">Proposed command</span>
                            <code>$ {cmd}</code>
                          </button>
                          <div class="tool-actions">
                            {#if state === 'running'}
                              <span class="tool-status running">Running…</span>
                            {:else if state === 'success'}
                              <span class="tool-status success">✓ Completed</span>
                            {:else if state === 'error'}
                              <span class="tool-status error">✕ Failed</span>
                            {:else if state === 'rejected'}
                              <span class="tool-status rejected">Rejected</span>
                            {:else}
                              <button class="primary approve-btn" onclick={() => handleCommandApprove(cmd, key)}>Approve and Run</button>
                              <button class="reject-btn" onclick={() => handleCommandReject(cmd, key)}>Reject</button>
                            {/if}
                          </div>
                        </div>
                      {/each}
                    </div>
                  {/if}
                {/if}

                <div class="follow-ups">
                  {#each followUpChips as chip}
                    <button type="button" class="follow-chip" onclick={() => useQuickAction(chip.text)}>
                      {chip.label}
                    </button>
                  {/each}
                </div>
              </div>
            </div>
          </article>
        {/if}
      {/each}

      {#if isStreaming}
        <article class="message assistant streaming" aria-busy="true">
          <div class="assistant-row">
            <div class="assistant-avatar pulsing" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </div>
            <div class="assistant-content">
              <div class="stream-stage" class:has-text={!!currentStreamText}>
                <div class="thinking" class:fade-out={!!currentStreamText} aria-label="Thinking">
                  <span class="shimmer-bar"></span>
                  <span class="thinking-label">Thinking</span>
                  <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
                <div class="stream-body" class:fade-in={!!currentStreamText} role="group" onclick={handleMarkdownClick} onkeydown={(e) => e.key === 'Enter' && handleMarkdownClick(e)}>
                  {#if currentStreamText}
                    {@html renderMarkdown(currentStreamText)}
                    <span class="stream-cursor" aria-hidden="true"></span>
                  {/if}
                </div>
              </div>
              {#if currentMeta?.score_breakdown}
                <div class="meta">
                  <span class="score">Score {currentMeta.score_breakdown.total}/100</span>
                </div>
              {/if}
            </div>
          </div>
        </article>
      {/if}
    </div>
  </div>

  <div class="composer-zone">
    {#if isEmpty}
      <div class="quick-actions" role="group" aria-label="Quick actions">
        {#each quickActions as action}
          <button type="button" class="quick-chip" onclick={() => useQuickAction(action.text)}>
            {action.label}
          </button>
        {/each}
      </div>
    {/if}

    <div class="composer-shell">
      <div class="composer glass-surface" class:focused={composerFocused}>
        <textarea
          bind:this={composerTextarea}
          bind:value={inputText}
          onkeydown={handleKeydown}
          oninput={resizeComposer}
          onfocus={() => (composerFocused = true)}
          onblur={() => (composerFocused = false)}
          placeholder="Message Finn… Shift+Enter for newline"
          rows={1}
          disabled={isStreaming}
          aria-label="Chat input"
        ></textarea>

        <div class="composer-bar">
          <div class="composer-left">
            <div class="mode-picker" role="group" aria-label="Chat mode">
              {#each modes as m}
                <button
                  type="button"
                  class="mode-pill"
                  class:active={appState.mode === m}
                  onclick={() => (appState.mode = m)}
                  aria-pressed={appState.mode === m}
                >{m}</button>
              {/each}
            </div>
            <button
              type="button"
              class="yolo-chip"
              class:active={appState.yolo}
              onclick={toggleYolo}
              aria-pressed={appState.yolo}
            >
              {appState.yolo ? 'YOLO' : 'Safe'}
            </button>
          </div>

          <div class="composer-right">
            {#if isStreaming}
              <button type="button" class="danger stop-btn" onclick={cancelStream}>Stop</button>
            {:else}
              <button
                type="button"
                class="primary send-btn"
                onclick={handleSubmit}
                disabled={!inputText.trim()}
                aria-label="Send message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 19V5M12 5l-5 5M12 5l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .chat-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    background: var(--abyss);
    position: relative;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    scroll-behavior: smooth;
    padding: 1.5rem 1rem 0.5rem;
  }

  .messages-inner {
    max-width: 820px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    min-height: 100%;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem 1rem 4rem;
    animation: finn-fade-in 400ms var(--spring-panel) both;
  }

  .empty-mark {
    color: var(--accent);
    opacity: 0.85;
    margin-bottom: 1rem;
  }

  .empty-title {
    margin: 0 0 0.35rem;
    font-size: 1.35rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .empty-sub {
    margin: 0 0 0.5rem;
    color: var(--text-secondary);
    font-size: 13px;
  }

  .engagement-tag {
    font-family: var(--font-mono);
    color: var(--accent);
    background: var(--accent-8);
    border: 1px solid var(--accent-20);
    padding: 0.1rem 0.45rem;
    border-radius: 999px;
    font-size: 11px;
  }

  .empty-hint {
    margin: 0;
    color: var(--text-tertiary);
    font-size: 12px;
    max-width: 360px;
  }

  .message {
    animation: finn-fade-in 280ms var(--spring-panel) both;
  }

  .message.user {
    display: flex;
    justify-content: flex-end;
  }

  .user-pill {
    max-width: min(85%, 560px);
    padding: 0.55rem 0.9rem;
    border-radius: 999px;
    background: var(--accent-12);
    border: 1px solid var(--accent-20);
    color: var(--text-primary);
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .assistant-row {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    width: 100%;
    position: relative;
  }

  .assistant-row::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 28px;
    bottom: 0;
    width: 1px;
    background: linear-gradient(to bottom, var(--accent-20), transparent);
    pointer-events: none;
  }

  .assistant-avatar {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    background: var(--glass);
    border: 1px solid var(--glass-border);
    color: var(--accent);
    margin-top: 2px;
  }

  .assistant-avatar.pulsing {
    box-shadow: 0 0 0 0 var(--accent-20);
    animation: avatar-pulse 2s ease-in-out infinite;
  }

  .assistant-content {
    flex: 1;
    min-width: 0;
    border-left: 2px solid var(--accent-12);
    padding-left: 0.85rem;
  }

  .assistant-body,
  .stream-body {
    font-size: 13px;
    line-height: 1.6;
    color: var(--text-primary);
    word-break: break-word;
  }

  .assistant-body :global(p),
  .stream-body :global(p) {
    margin: 0 0 0.55rem;
  }

  .assistant-body :global(p:last-child),
  .stream-body :global(p:last-child) {
    margin-bottom: 0;
  }

  .assistant-body :global(a),
  .stream-body :global(a) {
    color: var(--accent);
  }

  .assistant-body :global(ul),
  .assistant-body :global(ol),
  .stream-body :global(ul),
  .stream-body :global(ol) {
    margin: 0.35rem 0 0.65rem;
    padding-left: 1.25rem;
  }

  .assistant-body :global(code:not(pre code)),
  .stream-body :global(code:not(pre code)) {
    font-family: var(--font-mono);
    font-size: 12px;
    background: rgba(255, 255, 255, 0.06);
    padding: 0.12rem 0.35rem;
    border-radius: 4px;
  }

  .assistant-body :global(.artifact-card),
  .stream-body :global(.artifact-card) {
    margin: 0.65rem 0;
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-control);
    overflow: hidden;
    background: var(--abyss-1);
    box-shadow: inset 3px 0 0 var(--accent-20);
  }

  .assistant-body :global(.artifact-header),
  .stream-body :global(.artifact-header) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.35rem 0.6rem;
    background: var(--glass);
    border-bottom: 1px solid var(--glass-border);
  }

  .assistant-body :global(.artifact-lang),
  .stream-body :global(.artifact-lang) {
    font-family: var(--font-mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--accent);
  }

  .assistant-body :global(.artifact-copy),
  .stream-body :global(.artifact-copy) {
    font-size: 10px;
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    background: transparent;
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
  }

  .assistant-body :global(.artifact-copy:hover),
  .stream-body :global(.artifact-copy:hover) {
    color: var(--accent);
    border-color: var(--accent-20);
  }

  .assistant-body :global(.artifact-card pre),
  .stream-body :global(.artifact-card pre) {
    margin: 0;
    padding: 0.75rem;
    overflow-x: auto;
    background: transparent;
    border: none;
  }

  .assistant-body :global(.artifact-card pre code),
  .stream-body :global(.artifact-card pre code) {
    font-family: var(--font-mono);
    font-size: 12px;
    background: transparent;
    padding: 0;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    align-items: center;
    margin-top: 0.55rem;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-tertiary);
  }

  .score { color: var(--accent); }

  .badge {
    padding: 1px 5px;
    border-radius: 4px;
    font-weight: 600;
  }

  .badge.refusal {
    background: var(--danger-20);
    color: var(--danger);
  }

  .badge.compliant {
    background: var(--accent-12);
    color: var(--accent);
  }

  .copy-msg {
    margin-left: auto;
    padding: 1px 6px;
    font-size: 10px;
    border: 1px solid var(--glass-border);
    background: transparent;
    color: var(--text-secondary);
  }

  .tool-cards {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.65rem;
  }

  .tool-card {
    border: 1px solid var(--accent-20);
    background: var(--accent-8);
    border-radius: var(--radius-control);
    overflow: hidden;
    transition: border-color 180ms var(--spring-control), box-shadow 180ms var(--spring-control);
  }

  .tool-card.running {
    border-color: var(--warning);
    box-shadow: 0 0 0 1px var(--warning-20);
  }

  .tool-card.success {
    border-color: var(--accent-20);
    background: var(--accent-8);
  }

  .tool-card.error {
    border-color: rgba(255, 69, 58, 0.35);
    background: var(--danger-20);
  }

  .tool-card.rejected {
    opacity: 0.65;
  }

  .tool-preview {
    width: 100%;
    text-align: left;
    padding: 0.55rem 0.7rem;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    cursor: pointer;
  }

  .tool-preview:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .tool-label {
    display: block;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-tertiary);
    margin-bottom: 0.25rem;
  }

  .tool-preview code {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--accent);
    word-break: break-all;
  }

  .tool-actions {
    display: flex;
    gap: 0.45rem;
    align-items: center;
    padding: 0.45rem 0.7rem 0.55rem;
  }

  .approve-btn {
    font-size: 11px;
    padding: 0.35rem 0.65rem;
  }

  .reject-btn {
    font-size: 11px;
    padding: 0.35rem 0.65rem;
    border-color: rgba(255, 69, 58, 0.25);
    color: var(--danger);
    background: transparent;
  }

  .tool-status {
    font-family: var(--font-mono);
    font-size: 11px;
  }

  .tool-status.running { color: var(--warning); }
  .tool-status.success { color: var(--accent); }
  .tool-status.error { color: var(--danger); }
  .tool-status.rejected { color: var(--text-tertiary); }

  .follow-ups {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.7rem;
  }

  .follow-chip {
    font-size: 11px;
    padding: 0.28rem 0.6rem;
    border-radius: 999px;
    border: 1px solid var(--glass-border);
    background: var(--glass);
    color: var(--text-secondary);
    transition: border-color 150ms, color 150ms, background 150ms;
  }

  .follow-chip:hover {
    border-color: var(--accent-20);
    color: var(--accent);
    background: var(--accent-8);
  }

  .stream-stage {
    position: relative;
    min-height: 28px;
  }

  .thinking {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    color: var(--text-secondary);
    font-size: 12px;
    transition: opacity 260ms var(--spring-panel), transform 260ms var(--spring-panel);
  }

  .thinking.fade-out {
    opacity: 0;
    transform: translateY(-4px);
    pointer-events: none;
    position: absolute;
    inset: 0;
  }

  .shimmer-bar {
    width: 48px;
    height: 4px;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--accent-8), var(--accent-60), var(--accent-8));
    background-size: 200% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
  }

  .thinking-label {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-tertiary);
  }

  .thinking .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--accent);
    animation: pulse 1s ease-in-out infinite;
  }

  .thinking .dot:nth-child(4) { animation-delay: 0.12s; }
  .thinking .dot:nth-child(5) { animation-delay: 0.24s; }

  .stream-body {
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 320ms var(--spring-panel), transform 320ms var(--spring-panel);
  }

  .stream-body.fade-in {
    opacity: 1;
    transform: translateY(0);
  }

  .stream-cursor {
    display: inline-block;
    width: 2px;
    height: 1em;
    margin-left: 2px;
    vertical-align: text-bottom;
    background: var(--accent);
    animation: cursor-blink 1s step-end infinite;
  }

  .composer-zone {
    flex-shrink: 0;
    padding: 0.5rem 1rem 1.25rem;
    background: linear-gradient(to top, var(--abyss) 70%, transparent);
  }

  .composer-shell {
    max-width: 720px;
    margin: 0 auto;
  }

  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.4rem;
    margin-bottom: 0.65rem;
  }

  .quick-chip {
    font-size: 11px;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    border: 1px solid var(--glass-border);
    background: var(--glass);
    color: var(--text-secondary);
    transition: border-color 150ms, color 150ms, transform 180ms var(--spring-control);
  }

  .quick-chip:hover {
    border-color: var(--accent-20);
    color: var(--accent);
    background: var(--accent-8);
  }

  .composer {
    border-radius: var(--radius-dock);
    padding: 0.65rem 0.75rem 0.55rem;
    transition: border-color 180ms, box-shadow 180ms;
  }

  .composer.focused {
    border-color: var(--accent-20);
    box-shadow:
      0 0 0 1px var(--accent-12),
      0 0 24px rgba(0, 217, 146, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .composer textarea {
    width: 100%;
    border: none;
    background: transparent;
    resize: none;
    min-height: 24px;
    max-height: calc(22px * 8 + 16px);
    padding: 0.15rem 0.25rem 0.45rem;
    font-size: 14px;
    line-height: 22px;
    box-shadow: none;
  }

  .composer textarea:focus {
    outline: none;
    box-shadow: none;
    border-color: transparent;
  }

  .composer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding-top: 0.35rem;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
  }

  .composer-left {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex-wrap: wrap;
    min-width: 0;
  }

  .mode-picker {
    display: flex;
    gap: 0.2rem;
    padding: 0.15rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.04);
  }

  .mode-pill {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.2rem 0.45rem;
    border-radius: 999px;
    border: none;
    background: transparent;
    color: var(--text-tertiary);
    transition: background 150ms, color 150ms;
  }

  .mode-pill.active {
    background: var(--accent-12);
    color: var(--accent);
    font-weight: 600;
  }

  .mode-pill:hover:not(.active) {
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.04);
  }

  .yolo-chip {
    font-family: var(--font-mono);
    font-size: 10px;
    padding: 0.22rem 0.5rem;
    border-radius: 999px;
    border: 1px solid var(--glass-border);
    background: transparent;
    color: var(--text-tertiary);
    transition: border-color 150ms, color 150ms, background 150ms;
  }

  .yolo-chip.active {
    border-color: var(--danger);
    color: var(--danger);
    background: var(--danger-20);
  }

  .yolo-chip:not(.active) {
    color: var(--accent);
    border-color: var(--accent-20);
  }

  .send-btn {
    width: 34px;
    height: 34px;
    padding: 0;
    border-radius: 999px;
    display: grid;
    place-items: center;
  }

  .stop-btn {
    font-size: 11px;
    padding: 0.35rem 0.65rem;
  }

  @keyframes finn-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.15); }
  }

  @keyframes shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }

  @keyframes cursor-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  @keyframes avatar-pulse {
    0%, 100% { box-shadow: 0 0 0 0 var(--accent-20); }
    50% { box-shadow: 0 0 0 6px transparent; }
  }

  @media (prefers-reduced-motion: reduce) {
    .message,
    .empty-state,
    .thinking,
    .stream-body,
    .assistant-avatar.pulsing,
    .thinking .dot,
    .shimmer-bar,
    .stream-cursor {
      animation: none;
      transition: none;
    }

    .thinking.fade-out,
    .stream-body.fade-in {
      opacity: 1;
      transform: none;
    }
  }
</style>
