<script lang="ts">
	import ChevronRight from 'svelte-radix/ChevronRight.svelte';
	import ChevronLeft from 'svelte-radix/ChevronLeft.svelte';
	import DoubleArrowRight from 'svelte-radix/DoubleArrowRight.svelte';
	import DoubleArrowLeft from 'svelte-radix/DoubleArrowLeft.svelte';
	import type { TableViewModel } from 'svelte-headless-table';
	import type { Task } from '../(data)/schemas.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	let { tableModel }: { tableModel: TableViewModel<Task> } = $props();

	const { pageRows, pluginStates, rows } = tableModel;

	const { hasNextPage, hasPreviousPage, pageIndex, pageCount } = pluginStates.page;
	// Gunakan state untuk page size
	let currentPageSize = $state(10);

	function handlePageSizeChange(value: string) {
		const newSize = Number(value);
		currentPageSize = newSize;
		pluginStates.page.pageSize.set(newSize);
	}
</script>

<div class="flex items-center justify-between px-2">
	<div class="flex items-center space-x-6 lg:space-x-8 ms-auto">
		<div class="flex items-center space-x-2">
			<p class="text-sm font-medium">Rows per page</p>
			<Select.Root
				allowDeselect={false}
				type="single"
				value={`${currentPageSize}`}
				onValueChange={handlePageSizeChange}
			>
				<Select.Trigger class="h-8 w-[70px]">
					{String(currentPageSize)}
				</Select.Trigger>
				<Select.Content class="min-w-[70px]" side="top">
					{#each [10, 20, 30, 40, 50] as size (size)}
						<Select.Item value={`${size}`} class="text-sm">
							{size}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<div class="flex w-[100px] items-center justify-center text-sm font-medium">
			Page {$pageIndex + 1} of {$pageCount}
		</div>
		<div class="flex items-center space-x-2">
			<Button
				variant="outline"
				class="hidden h-8 w-8 p-0 lg:flex"
				onclick={() => ($pageIndex = 0)}
				disabled={!$hasPreviousPage}
			>
				<span class="sr-only">Go to first page</span>
				<DoubleArrowLeft size={15} />
			</Button>
			<Button
				variant="outline"
				class="h-8 w-8 p-0"
				onclick={() => ($pageIndex = $pageIndex - 1)}
				disabled={!$hasPreviousPage}
			>
				<span class="sr-only">Go to previous page</span>
				<ChevronLeft size={15} />
			</Button>
			<Button
				variant="outline"
				class="h-8 w-8 p-0"
				disabled={!$hasNextPage}
				onclick={() => ($pageIndex = $pageIndex + 1)}
			>
				<span class="sr-only">Go to next page</span>
				<ChevronRight size={15} />
			</Button>
			<Button
				variant="outline"
				class="hidden h-8 w-8 p-0 lg:flex"
				disabled={!$hasNextPage}
				onclick={() => ($pageIndex = Math.ceil($rows.length / $pageRows.length) - 1)}
			>
				<span class="sr-only">Go to last page</span>
				<DoubleArrowRight size={15} />
			</Button>
		</div>
	</div>
</div>
