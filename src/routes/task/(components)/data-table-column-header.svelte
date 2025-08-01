<script lang="ts">
	import EyeNone from 'svelte-radix/EyeNone.svelte';
	import ArrowDown from 'svelte-radix/ArrowDown.svelte';
	import ArrowUp from 'svelte-radix/ArrowUp.svelte';
	import CaretSort from 'svelte-radix/CaretSort.svelte';
	import type { TableViewModel } from 'svelte-headless-table';
	import type { Task } from '../(data)/schemas.js';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	let className: string | undefined | null = undefined;
	export { className as class };
	export let props: {
		select: never;
		sort: {
			order: 'desc' | 'asc' | undefined;
			toggle: (_: Event) => void;
			clear: () => void;
			disabled: boolean;
		};
		filter: never;
	};
	export let tableModel: TableViewModel<Task>;
	export let cellId: string;

	const { hiddenColumnIds } = tableModel.pluginStates.hide;

	function handleAscSort(e: Event) {
		if (props.sort.order === 'asc') {
			return;
		}
		props.sort.toggle(e);
	}

	function handleDescSort(e: Event) {
		if (props.sort.order === 'desc') {
			return;
		}
		if (props.sort.order === undefined) {
			// We can only toggle, so we toggle from undefined to 'asc' first
			props.sort.toggle(e);
		}
		props.sort.toggle(e); // Then we toggle from 'asc' to 'desc'
	}

	function handleHide() {
		hiddenColumnIds.update((ids: string[]) => {
			if (ids.includes(cellId)) {
				return ids;
			}
			return [...ids, cellId];
		});
	}
</script>

{#if !props.sort.disabled}
	<div class={cn('flex items-center', className)}>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props: buttonProps })}
					<Button
						variant="ghost"
						class="data-[state=open]:bg-accent -ml-3 h-8"
						size="sm"
						{...buttonProps}
					>
						<slot />
						{#if props.sort.order === 'desc'}
							<ArrowDown class="ml-2 h-4 w-4" />
						{:else if props.sort.order === 'asc'}
							<ArrowUp class="ml-2 h-4 w-4" />
						{:else}
							<CaretSort class="ml-2 h-4 w-4" />
						{/if}
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="start" class="w-[200px]" portalProps={{}}>
				<DropdownMenu.Item onclick={handleAscSort} class="cursor-default" inset={false}>
					<ArrowUp class="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
					Asc
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={handleDescSort} class="cursor-default" inset={false}>
					<ArrowDown class="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
					Desc
				</DropdownMenu.Item>
				<DropdownMenu.Separator class="my-1" />
				<DropdownMenu.Item onclick={handleHide} class="cursor-default" inset={false}>
					<EyeNone class="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
					Hide
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
{:else}
	<slot />
{/if}
