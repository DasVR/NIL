<script lang="ts">
  import AgentStream from '$lib/components/shell/AgentStream.svelte';
</script>

<div class="legacy-running">
  <AgentStream />
</div>

<style>
  .legacy-running { height: 100%; min-height: 0; display: flex; flex-direction: column; }
</style>
