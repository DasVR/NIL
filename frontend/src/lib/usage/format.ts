import type { TokenUsage } from '$lib/agent/types';

export function hasSpend(usage?: TokenUsage | null): boolean {
  if (!usage) return false;
  return usage.totalTokens > 0 || usage.costUsd > 0;
}

export function formatTokens(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '0';
  if (n < 1000) return String(Math.round(n));
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`;
}

export function formatUsd(cost: number): string {
  if (!Number.isFinite(cost) || cost <= 0) return '';
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 1) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
}

export function formatSpend(usage?: TokenUsage | null): string {
  if (!hasSpend(usage) || !usage) return '';
  const tokens = `${formatTokens(usage.promptTokens)} in / ${formatTokens(usage.completionTokens)} out`;
  const usd = formatUsd(usage.costUsd);
  return usd ? `${usd} · ${tokens}` : tokens;
}

export function formatSpendCompact(usage?: TokenUsage | null): string {
  if (!hasSpend(usage) || !usage) return '';
  const usd = formatUsd(usage.costUsd);
  const total = formatTokens(usage.totalTokens);
  return usd ? `${usd} · ${total}` : `${total} tok`;
}

export function spendWeight(usage?: TokenUsage | null): 'none' | 'low' | 'mid' | 'high' {
  if (!usage || usage.costUsd <= 0) return 'none';
  if (usage.costUsd < 0.1) return 'low';
  if (usage.costUsd < 1) return 'mid';
  return 'high';
}

export function fromApiUsage(raw?: {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  cost_usd?: number;
  provider?: string;
  model?: string;
} | null): TokenUsage | null {
  if (!raw) return null;
  const promptTokens = Number(raw.prompt_tokens) || 0;
  const completionTokens = Number(raw.completion_tokens) || 0;
  const totalTokens = Number(raw.total_tokens) || promptTokens + completionTokens;
  const costUsd = Number(raw.cost_usd) || 0;
  if (promptTokens === 0 && completionTokens === 0 && costUsd === 0) return null;
  return {
    promptTokens,
    completionTokens,
    totalTokens,
    costUsd,
    provider: raw.provider,
    model: raw.model,
  };
}
