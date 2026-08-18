<script lang="ts">
  import { tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { appState } from '$lib/stores.svelte';
  import { fuzzyFilter, highlightMatch } from '$lib/fuzzy';
  import { PALETTE_RECENTS_KEY } from '$lib/keymap';
  import { toast } from '$lib/toast.svelte';

  type Item = {
    id: string;
    label: string;
    hint?: string;
    section: string;
    run: () => void | Promise<void>;
    alt?: () => void | Promise<void>;
    altHint?: string;
  };

  let q = $state('');
  let active = $state(0);
  let recents = $state<string[]>([]);
  let inputEl: HTMLInputElement | undefined;

  $effect(() => {
    if (typeof window === 'undefined') return;
    recents = JSON.parse(localStorage.getItem(PALETTE_RECENTS_KEY) || '[]');
    void tick().then(() => inputEl?.focus());
  });

  const items = $derived.by((): Item[] => {
    const out: Item[] = [];
    const close = () => (appState.paletteOpen = false);
    const gotoMode = appState.paletteMode === 'goto';

    if (!gotoMode) {
      out.push({
        id: 'new-space',
        label: 'New Space',
        hint: '⌘N',
        section: 'Actions',
        run: () => {
          appState.newSpaceOpen = true;
          close();
        }
      });
      out.push({
        id: 'toggle-ai',
        label: appState.aiStripOpen ? 'Hide Finn' : 'Show Finn',
        hint: '⌘J',
        section: 'Actions',
        run: () => {
          appState.toggleAi();
          close();
        }
      });
      out.push({
        id: 'settings',
        label: 'Open settings',
        hint: '⌘,',
        section: 'Actions',
        run: () => {
          appState.settingsOpen = true;
          close();
        }
      });
      out.push({
        id: 'yolo',
        label: appState.yolo ? 'Disable YOLO' : 'Enable YOLO',
        hint: '⌘Y',
        section: 'Actions',
        run: () => {
          void appState.setYolo(!appState.yolo);
          close();
        }
      });
      out.push({
        id: 'view-term',
        label: 'Terminal view',
        hint: '⌘T',
        section: 'Actions',
        run: () => {
          appState.setView('terminal');
          close();
        }
      });
      out.push({
        id: 'view-art',
        label: 'Artifact view',
        hint: '⌘E',
        section: 'Actions',
        run: () => {
          appState.setView('artifact');
          close();
        }
      });
      out.push({
        id: 'view-split',
        label: 'Split view',
        hint: '⌘\\',
        section: 'Actions',
        run: () => {
          appState.setView('split');
          close();
        }
      });
      out.push({
        id: 'mode-hunt',
        label: 'Mode: hunt',
        hint: '> hunt',
        section: 'Actions',
        run: () => {
          appState.setMode('hunt');
          toast.show('Hunt mode');
          close();
        }
      });
      out.push({
        id: 'mode-chat',
        label: 'Mode: chat',
        hint: '> chat',
        section: 'Actions',
        run: () => {
          appState.setMode('chat');
          close();
        }
      });
      out.push({
        id: 'mode-report',
        label: 'Mode: report',
        hint: '> report',
        section: 'Actions',
        run: () => {
          appState.setMode('report');
          close();
        }
      });
      out.push({
        id: 'draft-report',
        label: 'Draft report artifact',
        section: 'Actions',
        run: () => {
          void appState.draftReport();
          close();
        }
      });

      if (appState.topPending) {
        const tool = 'tool' in appState.topPending ? appState.topPending.tool : 'command';
        out.push({
          id: 'approve',
          label: `Approve ${tool}`,
          hint: '⌘↵',
          section: 'Actions',
          run: async () => {
            await appState.approve(appState.topPendingId());
            close();
          }
        });
        out.push({
          id: 'reject',
          label: `Reject ${tool}`,
          hint: '⌘⇧↵',
          section: 'Actions',
          run: async () => {
            await appState.reject(appState.topPendingId());
            close();
          }
        });
      }

      for (const p of appState.plugins) {
        out.push({
          id: `plugin:${p.name}`,
          label: `Run ${p.name}`,
          hint: p.description,
          section: 'Plugins',
          run: async () => {
            const host = appState.activeTarget?.host;
            if (!host) {
              toast.show('Select a target first', 'warn');
              return;
            }
            await appState.runPlugin(p.name, host);
            close();
          }
        });
      }

      for (const e of appState.engagements) {
        out.push({
          id: `space:${e.name}`,
          label: e.name,
          hint: e.findings_count ? `${e.findings_count} findings` : 'Space',
          section: 'Spaces',
          run: async () => {
            await appState.select(e.name);
            close();
          }
        });
      }
    }

    for (const t of appState.targets) {
      out.push({
        id: `target:${t.host}`,
        label: t.host,
        hint: t.ports.length ? t.ports.join(', ') : 'target',
        section: 'Targets',
        run: () => {
          appState.selectTarget(t);
          close();
        },
        alt: () => {
          appState.selectTarget(t);
          appState.aiStripOpen = true;
          void appState.send(`Scan ${t.host} and summarize open services.`);
          close();
        },
        altHint: 'Ask Finn'
      });
    }

    if (!gotoMode) {
      for (const f of appState.findings) {
        out.push({
          id: `finding:${f.id}`,
          label: f.title,
          hint: f.severity,
          section: 'Findings',
          run: () => {
            appState.openFindingArtifact(f);
            close();
          },
          alt: () => {
            appState.askAboutFinding(f, 'Explain this finding and propose next steps.');
            close();
          },
          altHint: 'Explain'
        });
      }

      out.push({
        id: 'docs',
        label: 'Open documentation',
        section: 'Help',
        run: () => {
          void goto('/docs');
          close();
        }
      });
    }

    return out;
  });

  const filtered = $derived.by(() => {
    let query = q.trim();
    if (query.startsWith('>')) query = query.slice(1).trim();
    if (query.startsWith('?')) {
      return items.filter((i) => i.section === 'Help' || i.id === 'toggle-ai');
    }
    const pool = query ? fuzzyFilter(items, query, (item) => `${item.label} ${item.hint ?? ''} ${item.section}`) : items;
    if (!query) {
      const recentItems = recents
        .map((id) => pool.find((i) => i.id === id))
        .filter((i): i is Item => Boolean(i));
      const rest = pool.filter((i) => !recents.includes(i.id));
      return [...recentItems, ...rest].slice(0, 40);
    }
    return pool.slice(0, 40);
  });

  const sections = $derived.by(() => {
    const map = new Map<string, Item[]>();
    for (const item of filtered) {
      const key = !q.trim() && recents.includes(item.id) ? 'Recent' : item.section;
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return [...map.entries()];
  });

  $effect(() => {
    q;
    active = 0;
  });

  function remember(id: string) {
    const next = [id, ...recents.filter((x) => x !== id)].slice(0, 8);
    localStorage.setItem(PALETTE_RECENTS_KEY, JSON.stringify(next));
  }

  async function run(item: Item, alt = false) {
    remember(item.id);
    if (alt && item.alt) await item.alt();
    else await item.run();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      active = Math.min(filtered.length - 1, active + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      active = Math.max(0, active - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[active];
      if (item) void run(item, e.metaKey || e.ctrlKey);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (q) q = '';
      else {
        appState.paletteOpen = false;
        appState.paletteMode = 'root';
      }
    }
  }
</script>

<div class="overlay" role="dialog" aria-modal="true" aria-label="Command palette">
  <button class="backdrop" type="button" aria-label="Close palette" onclick={() => { appState.paletteOpen = false; appState.paletteMode = 'root'; }}></button>
  <div class="palette">
    <input
      bind:this={inputEl}
      bind:value={q}
      placeholder={appState.paletteMode === 'goto' ? 'Go to target…' : 'Search Spaces, targets, findings, plugins…'}
      onkeydown={onKey}
    />
    <div class="list" role="listbox">
      {#each sections as [section, rows]}
        <div class="sec">{section}</div>
        {#each rows as item}
          {@const idx = filtered.indexOf(item)}
          <button
            type="button"
            class="row"
            class:on={idx === active}
            role="option"
            aria-selected={idx === active}
            onclick={() => run(item)}
            onmouseenter={() => (active = idx)}
          >
            <span class="label">
              {#each highlightMatch(item.label, q.replace(/^>[ ]?/, '')) as part}
                <span class:hl={part.hit}>{part.ch}</span>
              {/each}
            </span>
            {#if item.hint}<span class="hint">{item.hint}</span>{/if}
          </button>
        {/each}
      {:else}
        <p class="empty">No matches.</p>
      {/each}
    </div>
    {#if filtered[active]}
      <aside class="panel">
        <h3>{filtered[active].label}</h3>
        <p>{filtered[active].hint || filtered[active].section}</p>
        {#if filtered[active].altHint}
          <p class="alt"><kbd>⌘↵</kbd> {filtered[active].altHint}</p>
        {/if}
      </aside>
    {/if}
    <footer>
      <span><kbd>↑↓</kbd> move</span>
      <span><kbd>↵</kbd> run</span>
      <span><kbd>⌘↵</kbd> alt</span>
      <span><kbd>esc</kbd> peel</span>
    </footer>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: grid;
    place-items: start center;
    padding-top: 10vh;
  }
  .backdrop {
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--abyss) 55%, transparent);
    border: 0;
    min-height: unset;
  }
  .palette {
    position: relative;
    width: min(640px, calc(100vw - 32px));
    max-height: min(520px, 70vh);
    display: grid;
    grid-template-rows: 48px 1fr 32px;
    grid-template-columns: 1fr 200px;
    background: var(--glass-3);
    border: 1px solid var(--glass-border-strong);
    border-radius: var(--radius-panel);
    overflow: hidden;
    box-shadow: var(--shadow-modal);
    backdrop-filter: blur(28px) saturate(1.5);
  }
  input {
    grid-column: 1 / -1;
    height: 48px;
    border: 0;
    border-bottom: 1px solid var(--glass-border);
    background: transparent;
    color: var(--text);
    font: 14px/1 var(--font-sans);
    padding: 0 16px;
    border-radius: 0;
  }
  .list {
    overflow: auto;
    padding: 6px;
  }
  .sec {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-faint);
    padding: 8px 10px 4px;
  }
  .row {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    height: 32px;
    min-height: unset;
    padding: 0 10px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--text);
    font: 13px/1 var(--font-sans);
    text-align: left;
  }
  .row.on { background: var(--abyss-3); }
  .hint { color: var(--text-faint); font-size: 11px; font-family: var(--font-mono); }
  .empty { padding: 24px; color: var(--text-faint); font-size: 13px; }
  .panel {
    border-left: 1px solid var(--glass-border);
    padding: 16px;
    background: var(--abyss);
  }
  .panel h3 { margin: 0 0 6px; font-size: 13px; }
  .panel p { margin: 0; font-size: 12px; color: var(--text-faint); line-height: 1.4; }
  .alt { margin-top: 10px !important; }
  footer {
    grid-column: 1 / -1;
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 0 12px;
    border-top: 1px solid var(--glass-border);
    font-size: 11px;
    color: var(--text-faint);
  }
  .hl { color: var(--green); font-weight: 600; }
</style>
