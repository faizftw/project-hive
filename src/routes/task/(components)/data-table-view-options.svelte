<script lang="ts">
	import MixerHorizontal from 'svelte-radix/MixerHorizontal.svelte';
	import type { TableViewModel } from 'svelte-headless-table';
	import type { Task } from '../(data)/schemas.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { onMount } from 'svelte';

	let { tableModel }: { tableModel: TableViewModel<Task> } = $props();
	const { pluginStates, flatColumns } = tableModel;
	const { hiddenColumnIds } = pluginStates.hide;

	onMount(() => {
		hiddenColumnIds.update((ids: string[]) => {
			if (!ids.includes('createdAt')) {
				return [...ids, 'createdAt'];
			}
			return ids;
		});
	});

	function handleHide(id: string) {
		hiddenColumnIds.update((ids: string[]) => {
			if (ids.includes(id)) {
				return ids.filter((i) => i !== id);
			}
			return [...ids, id];
		});
	}

	const hidableCols = ['title', 'description', 'status', 'priority', 'deadline'];
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger >
		{#snippet child({ props })}
			<Button variant="outline" size="sm" class="ml-auto hidden h-8 lg:flex" {...props}>
				<MixerHorizontal class="mr-2 h-4 w-4" />
				View
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Label>Toggle columns</DropdownMenu.Label>
		<DropdownMenu.Separator />
		{#each flatColumns as col}
			{#if hidableCols.includes(col.id)}
				<DropdownMenu.CheckboxItem
					checked={!$hiddenColumnIds.includes(col.id)}
					onclick={() => handleHide(col.id)}
				>
					{col.header}
				</DropdownMenu.CheckboxItem>
			{/if}
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
