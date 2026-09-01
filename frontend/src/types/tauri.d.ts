// Type declarations for Tauri and other globals

interface Window {
  __TAURI__?: {
    window?: {
      current: () => {
        dragMove?: () => void;
        minimize?: () => void;
        toggleMaximize?: () => void;
        close?: () => void;
        isMaximized?: () => Promise<boolean>;
        onMaximizedChanged?: (callback: (e: { payload: boolean }) => void) => void;
      };
    };
    event?: {
      listen: (event: string, handler: (e: any) => void) => Promise<() => void>;
      emit: (event: string, payload?: any) => Promise<void>;
    };
  };
}

interface Navigator {
  platform: string;
}

// Module declarations for Tauri APIs
declare module '@tauri-apps/api/event' {
  export function listen(event: string, handler: (e: any) => void): Promise<() => void>;
  export function emit(event: string, payload?: any): Promise<void>;
}

declare module '@tauri-apps/api/window' {
  export const appWindow: {
    current: () => {
      minimize: () => void;
      toggleMaximize: () => void;
      close: () => void;
      isMaximized: () => Promise<boolean>;
      onMaximizedChanged: (callback: (e: { payload: boolean }) => void) => void;
    };
  };
}

declare module '@tauri-apps/api/core' {
  export function invoke<T>(command: string, args?: Record<string, any>): Promise<T>;
}

declare module '@tauri-apps/plugin-store' {
  export function persistent<T>(name: string, defaultValue: T): Promise<{
    get: <K extends keyof T>(key: K) => T[K];
    set: <K extends keyof T>(key: K, value: T[K]) => void;
    save: () => Promise<void>;
  }>;
}