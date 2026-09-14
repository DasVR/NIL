<script lang="ts">
  import { agentRun } from '$lib/agent/run.svelte.ts';
  import { appState, type ComposerMode } from '$lib/stores/appState.svelte.ts';
  import {
    workspace,
    engagementFiles,
    type WorkstationMode,
    type ContextFile,
  } from '$lib/stores/workspace.svelte.ts';
  import ApprovalBlock from '$lib/components/ui/ApprovalBlock.svelte';
  import NilIcon from '$lib/ui/NilIcon.svelte';
  import OnDeviceHint from '$lib/components/ui/OnDeviceHint.svelte';
  import { jelly } from '$lib/motion/jelly.ts';
  import { droplet } from '$lib/motion/droplet';
  import { readProjectFile } from '$lib/project.svelte.ts';
  import { listenSpeech, playDictation, speechAvailable } from '$lib/motion/dictation.ts';
  import { cubicIn } from 'svelte/easing';
  import { untrack } from 'svelte';

  interface Props {
    inputEl?: HTMLTextAreaElement;
  }

  let { inputEl = $bindable() }: Props = $props();

  let input = $state(workspace.composerDraft);
  let mentionOpen = $state(false);
  let mentionQuery = $state('');
  let mentionIndex = $state(0);
  let modelOpen = $state(false);
  let modelWrap: HTMLDivElement | undefined = $state();
  let modelBtn: HTMLButtonElement | undefined = $state();
  let pickerEl: HTMLDivElement | undefined = $state();
  const uid = $props.id();
  const pickerId = `${uid}-model-menu`;
  const effortLabelId = `${pickerId}-effort`;
  let chipLeaving = $state<string | null>(null);
  let pillEl: HTMLSpanElement | undefined = $state();
  let lastMode = $state<WorkstationMode>(workspace.workstationMode);
  let composerEl: HTMLDivElement | undefined = $state();

  $effect(() => {
    const next = input;
    untrack(() => { workspace.composerDraft = next; });
  });

  $effect(() => {
    const el = inputEl;
    if (!el) return;
    appState.setComposerFocus(() => { el.focus(); });
  });

  $effect(() => {
    if (!modelOpen) return;
    const close = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (t && modelWrap?.contains(t)) return;
      modelOpen = false;
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  });

  // Menu-button pattern (WAI-ARIA APG): opening moves focus into the menu, on
  // the checked model so Enter is a no-op rather than a surprise switch.
  $effect(() => {
    if (!modelOpen) return;
    queueMicrotask(() => {
      const items = menuItems();
      (items.find((el) => el.getAttribute('aria-checked') === 'true') ?? items[0])?.focus();
    });
  });

  function menuItems(): HTMLElement[] {
    if (!pickerEl) return [];
    return Array.from(pickerEl.querySelectorAll<HTMLElement>('[role^="menuitem"]'));
  }

  function closeModelMenu(returnFocus = true) {
    modelOpen = false;
    if (returnFocus) modelBtn?.focus();
  }

  function onMenuKey(e: KeyboardEvent) {
    const items = menuItems();
    const i = items.indexOf(document.activeElement as HTMLElement);
    const last = items.length - 1;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        items[i >= last ? 0 : i + 1]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        items[i <= 0 ? last : i - 1]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        items[last]?.focus();
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        closeModelMenu();
        break;
      case 'Tab':
        // Menus don't hold Tab; let focus leave naturally and close behind it.
        closeModelMenu(false);
        break;
    }
  }

  function pickModel(id: string) {
    workspace.modelId = id;
    closeModelMenu();
  }

  function openMoreModels() {
    // Hand focus back to the trigger first so the settings sheet's focus trap
    // records it and returns there when the sheet closes.
    closeModelMenu();
    appState.openSettings('ai');
  }

  $effect(() => {
    const next = workspace.workstationMode;
    if (next === lastMode) return;
    const dir = next === 'pentest' ? 'right' : 'left';
    lastMode = next;
    if (pillEl) jelly(pillEl, dir);
  });

  const pending = $derived(agentRun.pendingApproval);
  const gated = $derived(Boolean(pending));

  function mentionQueryParts(raw: string): { needle: string; line: string | null } {
    const m = raw.match(/^(.*):(\d+(?:-\d+)?)$/);
    if (m && m[1]) return { needle: m[1], line: m[2] };
    return { needle: raw, line: null };
  }

  function mentionScore(file: ContextFile, q: string): number {
    const label = file.label.toLowerCase();
    const path = file.path.toLowerCase();
    if (label === q || path === q) return 0;
    if (label === `${q}.ts` || label === `${q}.py` || path.endsWith(`/${q}`)) return 1;
    if (label.startsWith(q)) return 2;
    if (label.includes(q)) return 3;
    return 4;
  }

  const mentionParts = $derived(mentionQueryParts(mentionQuery));

  const placeholder = $derived(
    gated
      ? 'Allow or deny the pending command'
      : agentRun.running
        ? 'Queue a follow-up'
        : workspace.workstationMode === 'pentest'
          ? 'Describe the next hunt step'
          : 'Ask NIL to build, edit, or inspect files',
  );

  const mentionAnchor = $derived.by(() => {
    if (!mentionOpen || !composerEl) return null;
    const r = composerEl.getBoundingClientRect();
    return {
      left: `${Math.round(r.left)}px`,
      width: `${Math.round(r.width)}px`,
      bottom: `${Math.round(window.innerHeight - r.top + 6)}px`,
    };
  });

  const pickerAnchor = $derived.by(() => {
    if (!modelOpen || !modelWrap) return null;
    const r = modelWrap.getBoundingClientRect();
    return {
      right: `${Math.round(window.innerWidth - r.right)}px`,
      bottom: `${Math.round(window.innerHeight - r.top + 6)}px`,
    };
  });

  const files = $derived.by(() => {
    const parsed = mentionParts;
    const q = parsed.needle;
    let known = engagementFiles();
    if (q) {
      known = known.filter((f) =>
        f.path.toLowerCase().includes(q) || f.label.toLowerCase().includes(q),
      );
      known.sort((a, b) => mentionScore(a, q) - mentionScore(b, q) || a.path.length - b.path.length);
    }
    if (!q) return known.slice(0, 40);
    const exact = known.some((f) => f.path.toLowerCase() === q || f.label.toLowerCase() === q);
    const list = exact ? known.slice(0, 40) : [
      ...known.slice(0, 39),
      { id: `pin:${q}`, path: q, label: q },
    ];
    if (!parsed.line) return list;
    return list.map((f) => ({
      ...f,
      id: `${f.id}:${parsed.line}`,
      path: `${f.path}:${parsed.line}`,
      label: `${f.label}:${parsed.line}`,
    }));
  });

  function gateExit(node: HTMLElement) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = reduced ? 80 : 160;
    return {
      duration: t0,
      easing: cubicIn,
      css: (t: number) =>
        `opacity: ${t};${reduced ? '' : ` transform: translateY(${(1 - t) * 4}px);`}`,
    };
  }

  // Per-file and total caps so a large attachment can't run away with the turn.
  const ATTACH_MAX_PER_FILE = 16000;
  const ATTACH_MAX_TOTAL = 60000;

  function attachTarget(raw: string): string {
    return raw.replace(/^@/, '').replace(/:\d+(?:-\d+)?$/, '');
  }

  // Send the real file contents through with the turn — not just a literal
  // "@path" the backend never resolves. Anything that isn't a readable file
  // (a pinned pseudo-path, or Tauri with no workspace bridge) falls back to a
  // plain reference so the affordance never claims to have sent content it didn't.
  async function composeTurn(text: string, chips: ContextFile[]): Promise<string> {
    if (chips.length === 0) return text;
    const blocks: string[] = [];
    let budget = ATTACH_MAX_TOTAL;
    for (const f of chips) {
      const content = budget > 0 ? await readProjectFile(attachTarget(f.path)) : null;
      if (content == null) {
        blocks.push(`@${f.path}`);
        continue;
      }
      const room = Math.min(ATTACH_MAX_PER_FILE, budget);
      const truncated = content.length > room;
      const body = truncated ? `${content.slice(0, room)}\n… (truncated)` : content;
      budget -= body.length;
      blocks.push(`Attached file ${f.path}:\n\`\`\`\n${body}\n\`\`\``);
    }
    return `${text}\n\n${blocks.join('\n\n')}`;
  }

  // SHAKE (motion.css #20): a rejected send — empty input, or gated on a
  // pending approval — gets the shudder + hot-border rejection gesture
  // instead of doing nothing. Re-triggerable on repeat rejections: remove
  // the class, force a reflow, then re-add it, so a second empty Enter in a
  // row still replays the animation rather than silently no-op'ing.
  function rejectSend() {
    const el = composerEl;
    if (!el) return;
    el.classList.remove('nil-shake');
    void el.offsetWidth;
    el.classList.add('nil-shake');
    // Timeout, not animationend: reduced-motion sets animation:none on
    // .nil-shake, so the event would never fire and the hot border would
    // stick forever for those users. 380ms matches the keyframe duration.
    setTimeout(() => el.classList.remove('nil-shake'), 380);
  }

  async function send() {
    const text = input.trim();
    if (!text || gated) {
      rejectSend();
      return;
    }
    const mode: ComposerMode = workspace.workstationMode === 'build' ? 'code' : appState.composerMode;
    const engagement = appState.activeEngagementId || 'default';
    const chips = [...workspace.attached];
    const extras = { model: workspace.modelId, effort: workspace.effort };
    workspace.dismissClarify();
    agentRun.dismissClarify();
    workspace.dictationActive = false;
    workspace.dictationPaused = false;
    input = '';
    workspace.composerDraft = '';
    mentionOpen = false;
    const payload = await composeTurn(text, chips);
    if (!workspace.sessionStarted) workspace.noteSession();
    if (agentRun.running) {
      agentRun.queueFollowup(payload, engagement, mode, extras);
    } else {
      agentRun.sendMessage(payload, engagement, mode, extras);
    }
  }

  function setMode(next: WorkstationMode) {
    if (next === workspace.workstationMode) return;
    if (agentRun.running) {
      workspace.requestMode(next);
      return;
    }
    workspace.workstationMode = next;
  }

  function onKey(e: KeyboardEvent) {
    if (mentionOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        mentionIndex = Math.min(mentionIndex + 1, Math.max(0, files.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        mentionIndex = Math.max(mentionIndex - 1, 0);
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        pickMention(mentionIndex);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        mentionOpen = false;
        return;
      }
    }
    if (e.key === 'Escape') {
      if (modelOpen) {
        e.preventDefault();
        modelOpen = false;
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey && !(e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      send();
    }
  }

  function onInput() {
    const at = input.lastIndexOf('@');
    if (at >= 0 && (at === 0 || /\s/.test(input[at - 1] ?? ''))) {
      const rest = input.slice(at + 1);
      if (!rest.includes(' ') && !rest.includes('\n')) {
        mentionOpen = true;
        mentionQuery = rest.toLowerCase();
        mentionIndex = 0;
        return;
      }
    }
    mentionOpen = false;
  }

  function pickMention(index: number) {
    const file = files[index];
    if (!file) return;
    workspace.attachFile(file);
    const at = input.lastIndexOf('@');
    if (at >= 0) input = input.slice(0, at).trimEnd() + (at > 0 ? ' ' : '');
    mentionOpen = false;
  }

  function dismissChip(id: string) {
    chipLeaving = id;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => {
      workspace.detachFile(id);
      chipLeaving = null;
    }, reduced ? 80 : 180);
  }

  function toggleDictation() {
    if (workspace.dictationPaused) {
      workspace.dictationPaused = false;
      workspace.dictationActive = true;
      return;
    }
    workspace.dictationActive = !workspace.dictationActive;
  }

  $effect(() => {
    if (!workspace.dictationActive || workspace.dictationPaused) {
      untrack(() => { workspace.dictationLevel = 0; });
      return;
    }
    const base = untrack(() => input);
    let last = base;
    let playAbort: AbortController | null = null;
    let cool: ReturnType<typeof setTimeout> | null = null;
    const stop = listenSpeech((text) => {
      workspace.dictationLevel = Math.min(1, 0.4 + Math.min(text.length, 40) / 50);
      if (cool) clearTimeout(cool);
      cool = setTimeout(() => { workspace.dictationLevel = 0.15; }, 280);
      const prefix = base.replace(/\s+$/, '');
      const next = prefix ? `${prefix} ${text}` : text;
      playAbort?.abort();
      playAbort = new AbortController();
      const from = last;
      void playDictation(from, next, (v) => {
        input = v;
        last = v;
      }, { signal: playAbort.signal });
    });
    return () => {
      playAbort?.abort();
      if (cool) clearTimeout(cool);
      stop();
      workspace.dictationLevel = 0;
    };
  });
</script>

<div class="composer nil-scan nil-composer" bind:this={composerEl} data-state={agentRun.running ? 'working' : undefined}>
  {#if workspace.attached.length}
    <div class="chips" aria-label="Attached files">
      {#each workspace.attached as file (file.id)}
        <span class="chip" class:leaving={chipLeaving === file.id}>
          <button class="chip-path nil-halo nil-quiet" type="button" onclick={() => workspace.openFile(file.path)}>{file.path}</button>
          <button class="chip-x nil-halo nil-quiet" type="button" aria-label={`Detach ${file.path}`} onclick={() => dismissChip(file.id)}>
            <NilIcon name="x" size={16} />
          </button>
        </span>
      {/each}
    </div>
  {/if}

  {#if agentRun.queued.length}
    <div class="chips" aria-label="Queued follow-ups">
      {#each agentRun.queued as item (item.id)}
        <span class="chip">
          <span class="chip-path">queued · {item.text}</span>
          <button class="chip-x nil-halo nil-quiet" type="button" aria-label="Remove queued follow-up" onclick={() => agentRun.dropFollowup(item.id)}>
            <NilIcon name="x" size={16} />
          </button>
        </span>
      {/each}
    </div>
  {/if}

  {#if pending}
    <div class="gate-host" out:gateExit>
      <ApprovalBlock step={pending} />
    </div>
  {/if}

  <div class="row">
    <textarea
      id="agent-composer"
      bind:this={inputEl}
      bind:value={input}
      onkeydown={onKey}
      oninput={onInput}
      rows="1"
      aria-label="Agent input"
      aria-live={workspace.dictationActive ? 'polite' : undefined}
      placeholder={placeholder}
      disabled={gated}
    ></textarea>
    <button
      class="icon-btn nil-lift nil-halo"
      type="button"
      aria-label="Voice input"
      aria-pressed={workspace.dictationActive}
      onclick={toggleDictation}
    >
      <NilIcon name={workspace.dictationActive ? 'audio-lines' : 'mic'} size={16} />
    </button>
    <button
      class="nil-lift nil-halo send"
      type="button"
      onclick={send}
      disabled={!input.trim() || gated}
      aria-label={agentRun.running ? 'Queue follow-up' : 'Send'}
      data-cuelume-press
      data-cuelume-release="whisper"
    >
      {agentRun.running ? 'Queue' : 'Send'} <kbd aria-hidden="true">↵</kbd>
    </button>
  </div>

  {#if mentionOpen && mentionAnchor}
    <div
      class="mentions"
      role="listbox"
      aria-label="Mention a file"
      style:left={mentionAnchor.left}
      style:width={mentionAnchor.width}
      style:bottom={mentionAnchor.bottom}
    >
      {#if files.length === 0}
        <div class="empty">Type a path to pin it</div>
      {:else}
        {#each files as file, i (file.id)}
          <button
            class="mention"
            class:on={i === mentionIndex}
            type="button"
            role="option"
            aria-selected={i === mentionIndex}
            {@attach droplet}
            onclick={() => pickMention(i)}
          >
            <span class="m-label">{file.label}</span>
            <span class="m-path">{file.path}</span>
          </button>
        {/each}
      {/if}
    </div>
  {/if}

    {#if workspace.dictationActive}
    <OnDeviceHint active={!workspace.dictationPaused} available={speechAvailable()} level={workspace.dictationLevel} />
  {/if}

  <div class="bar">
    <div class="segment" role="group" aria-label="Workstation mode">
      <!-- Charter amendment 2026-09-07: Law 3 exception. Goo applies ONLY to
           .chip-bg. Labels stay in the buttons above and are never filtered. -->
      <svg class="goo-defs" aria-hidden="true" focusable="false">
        <defs>
          <filter id="nil-goo-surface">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <span
        class="pill-track"
        style:transform={workspace.workstationMode === 'pentest' ? 'translateX(100%)' : 'translateX(0)'}
      >
        <span
          class="pill chip-bg nil-jelly"
          bind:this={pillEl}
          style:--jelly-origin={lastMode === 'pentest' ? 'right center' : 'left center'}
        ></span>
      </span>
      <button
        class="seg nil-quiet nil-halo"
        class:on={workspace.workstationMode === 'build'}
        type="button"
        aria-pressed={workspace.workstationMode === 'build'}
        onclick={() => setMode('build')}
      >Build</button>
      <button
        class="seg nil-quiet nil-halo"
        class:on={workspace.workstationMode === 'pentest'}
        type="button"
        aria-pressed={workspace.workstationMode === 'pentest'}
        onclick={() => setMode('pentest')}
      >Pentest</button>
    </div>

    <div class="model-wrap" bind:this={modelWrap}>
      <button
        class="model nil-halo"
        type="button"
        bind:this={modelBtn}
        aria-label={`Model: ${workspace.model.name}`}
        aria-haspopup="menu"
        aria-expanded={modelOpen}
        aria-controls={modelOpen ? pickerId : undefined}
        onclick={() => (modelOpen = !modelOpen)}
      >
        {workspace.model.name}
        <NilIcon name="chevron-down" size={16} />
      </button>
      {#if modelOpen && pickerAnchor}
        <div
          id={pickerId}
          class="picker"
          role="menu"
          aria-label="Model and effort"
          tabindex="-1"
          bind:this={pickerEl}
          style:right={pickerAnchor.right}
          style:bottom={pickerAnchor.bottom}
          onkeydown={onMenuKey}
        >
          {#each workspace.models as m (m.id)}
            <button
              class="pick nil-halo"
              type="button"
              role="menuitemradio"
              aria-checked={m.id === workspace.modelId}
              tabindex="-1"
              {@attach droplet}
              onclick={() => pickModel(m.id)}
            >
              <span class="pick-name">{m.name}</span>
              <span class="pick-desc">{m.description}</span>
              {#if m.id === workspace.modelId}
                <span class="check" aria-hidden="true"><NilIcon name="check" size={16} /></span>
              {/if}
            </button>
          {/each}
          <div class="divider" role="separator"></div>
          <div class="effort" role="group" aria-labelledby={effortLabelId}>
            <span id={effortLabelId}>Effort</span>
            {#each (['low', 'medium', 'high'] as const) as level}
              <button
                class="eff nil-halo"
                class:on={workspace.effort === level}
                type="button"
                role="menuitemradio"
                aria-checked={workspace.effort === level}
                tabindex="-1"
                onclick={() => (workspace.effort = level)}
              >{level}</button>
            {/each}
          </div>
          <button
            class="pick more nil-halo"
            type="button"
            role="menuitem"
            tabindex="-1"
            onclick={openMoreModels}
          >More models</button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .composer {
    display: flex;
    flex-direction: column;
    gap: var(--s-2);
    padding: var(--s-2) var(--s-3);
    background: var(--nil-panel);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-panel);
    box-shadow: var(--lift-1);
    flex-shrink: 0;
    transition: border-color var(--dur-flip) var(--ease-out);
    position: relative;
    isolation: isolate;
    z-index: var(--z-overlay);
  }
  .composer:focus-within { border-color: var(--nil-line-hot); }

  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 22px;
    padding: 0 4px 0 8px;
    border: 1px solid var(--nil-line);
    border-radius: var(--r-chip);
    background: var(--nil-raised);
    transform: scale(1);
    opacity: 1;
    transition: transform var(--dur-enter) var(--ease-out),
                opacity var(--dur-enter) var(--ease-out);
  }
  .chip.leaving { transform: scale(0.86); opacity: 0; }
  .chip-path {
    font: var(--t-micro)/1 var(--font-machine);
    color: var(--nil-ink-2);
    border: 0;
    background: transparent;
    padding: 0;
    cursor: pointer;
  }
  .chip-path:hover { color: var(--nil-ink); }
  .chip-x {
    display: grid;
    place-items: center;
    width: 16px;
    height: 16px;
    border: 0;
    background: transparent;
    color: var(--nil-ink-3);
    cursor: pointer;
  }

  .row {
    display: flex;
    align-items: flex-end;
    gap: var(--s-2);
  }
  textarea {
    flex: 1;
    min-height: 28px;
    max-height: 96px;
    padding: 6px 0;
    border: 0;
    background: transparent;
    color: var(--nil-ink);
    font: var(--t-body)/1.45 var(--font-ui);
    resize: none;
    outline: none;
  }
  textarea:disabled { color: var(--nil-ink-3); }

  .icon-btn {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border: 0;
    background: transparent;
    color: var(--nil-ink-3);
    cursor: pointer;
    border-radius: var(--r-field);
  }
  .icon-btn:hover, .icon-btn[aria-pressed="true"] { color: var(--nil-ink); background: var(--nil-raised); }

  .send {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 var(--s-3);
    border: 1px solid var(--nil-line);
    border-radius: var(--r-field);
    background: var(--nil-raised);
    color: var(--nil-ink);
    font: 500 var(--t-meta)/1 var(--font-ui);
    cursor: pointer;
  }
  .send:disabled { opacity: 0.4; cursor: not-allowed; }
  .send kbd { font: var(--t-micro)/1 var(--font-machine); color: var(--nil-ink-2); }

  .mentions {
    position: fixed;
    background: var(--nil-raised);
    border: 1px solid var(--nil-line-hot);
    border-radius: var(--r-card);
    box-shadow: var(--lift-2);
    z-index: var(--z-overlay);
    max-height: 180px;
    overflow: auto;
    padding: 4px;
  }
  .mention {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    padding: 6px 8px;
    border: 0;
    background: transparent;
    text-align: left;
    cursor: pointer;
    border-radius: var(--r-field);
  }
  .mention.on, .mention:hover { background: var(--nil-panel); }
  .m-label { font: 500 var(--t-meta)/1 var(--font-ui); color: var(--nil-ink); }
  .m-path { font: var(--t-micro)/1 var(--font-machine); color: var(--nil-ink-3); }
  .empty { padding: 8px; font: var(--t-meta)/1 var(--font-ui); color: var(--nil-ink-3); }

  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-3);
  }

  .segment {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 168px;
    height: 26px;
    padding: 2px;
    background: var(--nil-void);
    border: 1px solid var(--nil-line);
    border-radius: 999px;
  }
  .goo-defs {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
  }
  .pill-track {
    position: absolute;
    top: 2px;
    left: 2px;
    width: calc(50% - 2px);
    height: calc(100% - 4px);
    pointer-events: none;
    transition: transform var(--dur-jelly) var(--ease-pop);
  }
  .pill {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 999px;
    background: var(--nil-raised);
    border: 1px solid var(--nil-line-hot);
    transform-origin: var(--jelly-origin, left center);
    filter: url(#nil-goo-surface);
  }
  .seg {
    position: relative;
    z-index: 1;
    width: 100%;
    border: 0;
    background: transparent;
    color: var(--nil-ink-3);
    font: 500 var(--t-micro)/1 var(--font-ui);
    cursor: pointer;
    border-radius: 999px;
  }
  .seg.on { color: var(--nil-ink); }
  @media (prefers-reduced-motion: reduce) {
    .pill { filter: none; }
  }

  .model-wrap { position: relative; }
  .model {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 24px;
    padding: 0 8px;
    border: 1px solid var(--nil-line);
    border-radius: 999px;
    background: transparent;
    color: var(--nil-ink-2);
    font: 500 var(--t-micro)/1 var(--font-ui);
    cursor: pointer;
  }
  .picker {
    position: fixed;
    width: 260px;
    max-height: min(360px, calc(100dvh - 8rem));
    overflow: auto;
    background: var(--nil-raised);
    border: 1px solid var(--nil-line-hot);
    border-radius: var(--r-card);
    box-shadow: var(--lift-3);
    padding: 4px;
    z-index: var(--z-overlay);
  }
  .pick {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    padding: 8px 28px 8px 8px;
    border: 0;
    background: transparent;
    text-align: left;
    cursor: pointer;
    border-radius: var(--r-field);
  }
  .pick:hover { background: var(--nil-panel); }
  .pick-name { font: 500 var(--t-meta)/1 var(--font-ui); color: var(--nil-ink); }
  .pick-desc { font: var(--t-micro)/1.3 var(--font-ui); color: var(--nil-ink-3); }
  .check { position: absolute; right: 8px; top: 10px; color: var(--nil-ink); }
  .divider { height: 1px; background: var(--nil-line); margin: 4px 0; }
  .effort {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 8px;
    font: var(--t-micro)/1 var(--font-ui);
    color: var(--nil-ink-3);
  }
  .eff {
    border: 1px solid var(--nil-line);
    background: transparent;
    color: var(--nil-ink-2);
    border-radius: var(--r-chip);
    padding: 2px 6px;
    font: 500 var(--t-micro)/1 var(--font-ui);
    cursor: pointer;
  }
  .eff.on { color: var(--nil-ink); border-color: var(--nil-line-hot); background: var(--nil-panel); }
  .more { color: var(--nil-ink-2); }
</style>
