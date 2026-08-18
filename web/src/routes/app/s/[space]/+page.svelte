<script>
  import WorkspaceRedirect from '$lib/components/WorkspaceRedirect.svelte';
  let { data } = $props();
</script>

<WorkspaceRedirect space={data.space} />
