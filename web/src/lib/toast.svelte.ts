export type ToastKind = 'ok' | 'warn' | 'danger' | 'info';

export type Toast = {
  id: string;
  kind: ToastKind;
  message: string;
};

class ToastBus {
  items = $state<Toast[]>([]);

  show(message: string, kind: ToastKind = 'ok', ms = 1800) {
    const id = crypto.randomUUID();
    this.items = [...this.items, { id, kind, message }];
    window.setTimeout(() => {
      this.items = this.items.filter((t) => t.id !== id);
    }, ms);
  }
}

export const toast = new ToastBus();
