<script module lang="ts">
  import Check from '@lucide/svelte/icons/check';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import ChevronLeft from '@lucide/svelte/icons/chevron-left';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import Clock from '@lucide/svelte/icons/clock';
  import File from '@lucide/svelte/icons/file';
  import FileText from '@lucide/svelte/icons/file-text';
  import Flag from '@lucide/svelte/icons/flag';
  import Folder from '@lucide/svelte/icons/folder';
  import Hammer from '@lucide/svelte/icons/hammer';
  import Lock from '@lucide/svelte/icons/lock';
  import Paperclip from '@lucide/svelte/icons/paperclip';
  import Search from '@lucide/svelte/icons/search';
  import Shield from '@lucide/svelte/icons/shield';
  import X from '@lucide/svelte/icons/x';
  import Copy from '@lucide/svelte/icons/copy';
  import Server from '@lucide/svelte/icons/server';
  import Network from '@lucide/svelte/icons/network';
  import Briefcase from '@lucide/svelte/icons/briefcase';
  import Globe from '@lucide/svelte/icons/globe';
  import AudioLines from '@lucide/svelte/icons/audio-lines';
  import Mic from '@lucide/svelte/icons/mic';
  import AppWindow from '@lucide/svelte/icons/app-window';
  import RefreshCw from '@lucide/svelte/icons/refresh-cw';
  import GitBranch from '@lucide/svelte/icons/git-branch';
  import GitCompare from '@lucide/svelte/icons/git-compare';
  import GitPullRequest from '@lucide/svelte/icons/git-pull-request';
  import Plug from '@lucide/svelte/icons/plug';
  import Plus from '@lucide/svelte/icons/plus';
  import Rows3 from '@lucide/svelte/icons/rows-3';
  import Terminal from '@lucide/svelte/icons/terminal';
  import Type from '@lucide/svelte/icons/type';
  import PanelLeft from '@lucide/svelte/icons/panel-left';
  import PanelRight from '@lucide/svelte/icons/panel-right';
  import FastForward from '@lucide/svelte/icons/fast-forward';
  import Save from '@lucide/svelte/icons/save';
  import Settings from '@lucide/svelte/icons/settings';
  import Command from '@lucide/svelte/icons/command';

  /**
   * Lucide-only icon wrapper. NIL does not mix icon families.
   * Default 16px. Rail icons (the control itself) may pass 20.
   *
   * Bundled at build time, not fetched at runtime: the previous version used
   * @iconify/svelte's default mode, which lazily fetches each icon's SVG data
   * from a remote API on first render. Until that fetch resolves, the <Icon>
   * component renders nothing — no placeholder, no reserved box — which
   * collapsed the fixed-width icon column in every CSS Grid row that assumed
   * the icon would occupy it (the file explorer's rows, for one, had their
   * text squeezed into the icon's 16px track and truncated to a single
   * character). A slow network, an ad-blocker, or a genuinely offline
   * machine — not a rare case for a pentest tool run on an isolated
   * engagement network — hit this on every icon in the app. Importing each
   * icon as its own Svelte component ships the SVG in the bundle, so it
   * paints synchronously on first render like any other element.
   *
   * This map is exhaustive, not a passthrough, on purpose: a name that isn't
   * here fails svelte-check, not a silently blank icon slot at runtime — that
   * caught 'github' (paletteStore.svelte.ts), which never actually existed
   * in Lucide even under the old setup; it hit this exact collapse bug too,
   * just unnoticed because nothing was diffing rendered vs. requested icons.
   */
  const ICONS = {
    check: Check,
    'chevron-down': ChevronDown,
    'chevron-left': ChevronLeft,
    'chevron-right': ChevronRight,
    clock: Clock,
    file: File,
    'file-text': FileText,
    flag: Flag,
    folder: Folder,
    hammer: Hammer,
    lock: Lock,
    paperclip: Paperclip,
    search: Search,
    shield: Shield,
    x: X,
    copy: Copy,
    server: Server,
    network: Network,
    briefcase: Briefcase,
    globe: Globe,
    'audio-lines': AudioLines,
    mic: Mic,
    'app-window': AppWindow,
    'refresh-cw': RefreshCw,
    'git-branch': GitBranch,
    'git-compare': GitCompare,
    'git-pull-request': GitPullRequest,
    plug: Plug,
    plus: Plus,
    'rows-3': Rows3,
    terminal: Terminal,
    type: Type,
    'panel-left': PanelLeft,
    'panel-right': PanelRight,
    'fast-forward': FastForward,
    save: Save,
    settings: Settings,
    command: Command,
  } as const;

  export type NilIconName = keyof typeof ICONS;
</script>

<script lang="ts">
  interface Props {
    name: NilIconName;
    size?: 16 | 20;
    class?: string;
  }

  let { name, size = 16, class: className }: Props = $props();
  const Comp = $derived(ICONS[name]);
</script>

<Comp width={size} height={size} class={className} aria-hidden="true" />
