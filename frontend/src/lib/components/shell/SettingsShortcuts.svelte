<script lang="ts">
  import { shortcutLabel } from '$lib/shortcuts';

  interface ShortcutRow {
    label: string;
    chord: string;
  }

  interface ShortcutGroup {
    heading: string;
    rows: ShortcutRow[];
  }

  const groups: ShortcutGroup[] = [
    {
      heading: 'General',
      rows: [
        { label: 'Command palette', chord: 'Mod+K' },
        { label: 'Focus composer', chord: 'Mod+J' },
        { label: 'Settings', chord: 'Mod+,' },
        { label: 'Toggle sidebar', chord: 'Mod+B' },
        { label: 'Toggle inspector', chord: 'Mod+\\' },
      ],
    },
    {
      heading: 'Agent',
      rows: [
        { label: 'Approve pending tool', chord: 'Mod+Enter' },
        { label: 'Reject pending tool', chord: 'Mod+Shift+Enter' },
        { label: 'Toggle YOLO', chord: 'Mod+Y' },
      ],
    },
    {
      heading: 'Terminal',
      rows: [
        { label: 'Toggle terminal dock', chord: 'Mod+T' },
        { label: 'Hide dock / close file', chord: 'Mod+W' },
      ],
    },
  ];
</script>

<div class="settings-pane">
  <h3>Keyboard shortcuts</h3>
  <p class="settings-description">Workstation bindings for this machine.</p>
  {#each groups as group (group.heading)}
    <div class="settings-group">
      <h4>{group.heading}</h4>
      {#each group.rows as row (row.chord)}
        <div class="settings-row">
          <span>{row.label}</span>
          <kbd>{shortcutLabel(row.chord)}</kbd>
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .settings-pane { padding: var(--s-4); }
  .settings-description { font-size: var(--t-meta); color: var(--nil-ink-3); margin-bottom: var(--s-4); }
  .settings-group { margin-bottom: var(--s-4); }
  .settings-group h4 { font-size: var(--t-micro); letter-spacing: var(--track-tick); text-transform: uppercase; color: var(--nil-ink-3); margin-bottom: var(--s-2); }
  .settings-row { display: flex; align-items: center; justify-content: space-between; padding: var(--s-2) 0; border-bottom: 1px solid var(--nil-line); font: var(--t-meta)/1 var(--font-ui); color: var(--nil-ink); }
  kbd { font: var(--t-micro)/1 var(--font-machine); color: var(--nil-ink-2); }
</style>
