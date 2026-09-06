import api, { type UsageSummary } from '$lib/api';
import type { TokenUsage } from '$lib/agent/types';
import { fromApiUsage, hasSpend } from '$lib/usage/format';

let promptTokens = $state(0);
let completionTokens = $state(0);
let totalTokens = $state(0);
let costUsd = $state(0);
let lastTurn = $state<TokenUsage | null>(null);
let byProvider = $state<UsageSummary['by_provider']>([]);
let engagement = $state<string | null>(null);
let loaded = $state(false);

function applySummary(summary: UsageSummary) {
  promptTokens = summary.prompt_tokens || 0;
  completionTokens = summary.completion_tokens || 0;
  totalTokens = summary.total_tokens || promptTokens + completionTokens;
  costUsd = summary.cost_usd || 0;
  byProvider = summary.by_provider || [];
  loaded = true;
}

export const usageStore = {
  get promptTokens() { return promptTokens; },
  get completionTokens() { return completionTokens; },
  get totalTokens() { return totalTokens; },
  get costUsd() { return costUsd; },
  get lastTurn() { return lastTurn; },
  get byProvider() { return byProvider; },
  get loaded() { return loaded; },
  get engagement() { return engagement; },
  get totals(): TokenUsage {
    return { promptTokens, completionTokens, totalTokens, costUsd };
  },

  async refresh(nextEngagement?: string | null) {
    const id = nextEngagement === undefined ? engagement : nextEngagement;
    engagement = id || null;
    try {
      const summary = await api.getUsage(id || undefined);
      applySummary(summary);
    } catch {
      loaded = false;
    }
  },

  recordTurn(usage: TokenUsage | null) {
    lastTurn = usage;
    if (!usage || !hasSpend(usage)) return;
    promptTokens += usage.promptTokens;
    completionTokens += usage.completionTokens;
    totalTokens += usage.totalTokens;
    costUsd += usage.costUsd;
    loaded = true;
  },

  fromApi: fromApiUsage,
};
