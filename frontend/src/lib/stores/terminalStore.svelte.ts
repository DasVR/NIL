// Terminal store (Svelte 5 runes)

interface TerminalState {
  terminal: any | null;
  webSocket: WebSocket | null;
  connected: boolean;
  cols: number;
  rows: number;
}

let terminal = $state<TerminalState['terminal']>(null);
let webSocket = $state<TerminalState['webSocket']>(null);
let connected = $state(false);
let cols = $state(80);
let rows = $state(24);

export const terminalStore = {
  get terminal() { return terminal; },
  set terminal(v: TerminalState['terminal']) { terminal = v; },
  get webSocket() { return webSocket; },
  set webSocket(v: TerminalState['webSocket']) { webSocket = v; },
  get connected() { return connected; },
  set connected(v: boolean) { connected = v; },
  get cols() { return cols; },
  set cols(v: number) { cols = v; },
  get rows() { return rows; },
  set rows(v: number) { rows = v; },

  setTerminal: (t: TerminalState['terminal']) => { terminal = t; },
  setWebSocket: (ws: TerminalState['webSocket']) => { webSocket = ws; },
  setConnected: (c: boolean) => { connected = c; },
  resize: (c: number, r: number) => { cols = c; rows = r; },
};