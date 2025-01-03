<script lang="ts">
	import { projectsStore } from '$lib/stores/projects';
	import type { Project } from '$lib/types';
	
	export let projectId: string;
	let project: Project | undefined;
	
	$: project = $projectsStore.find((p) => p.id === projectId);
</script>

<div class="flex space-x-2">
	{#if project}
		<span class="max-w-[500px] truncate font-medium">
			{project.name}
		</span>
	{:else}
		<span class="text-muted-foreground">
			{projectId ? 'Loading...' : 'No Project'}
		</span>
	{/if}
</div>
