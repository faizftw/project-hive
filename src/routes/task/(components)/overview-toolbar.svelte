<script lang="ts">
	import type { TableViewModel } from 'svelte-headless-table';
	import Cross2 from 'svelte-radix/Cross2.svelte';
	import type { Writable } from 'svelte/store';
	import { priorities, statuses } from '../(data)/data.js';
	import type { Task } from '../(data)/schemas.js';
	import { DataTableFacetedFilter, DataTableViewOptions } from './index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	export let tableModel: TableViewModel<Task>;
	export let data: Task[];

	const counts = data.reduce<{
		status: { [index: string]: number };
		priority: { [index: string]: number };
	}>(
		(acc, { status, priority }) => {
			acc.status[status] = (acc.status[status] || 0) + 1;
			acc.priority[priority] = (acc.priority[priority] || 0) + 1;
			return acc;
		},
		{
			status: {},
			priority: {}
		}
	);

	const { pluginStates } = tableModel;
	const {
		filterValue
	}: {
		filterValue: Writable<string>;
	} = pluginStates.filter;

	const {
		filterValues
	}: {
		filterValues: Writable<{
			status: string[];
			priority: string[];
		}>;
	} = pluginStates.colFilter;

	$: showReset = Object.values({ ...$filterValues, $filterValue }).some((v) => v.length > 0);
</script>

<div class="w-full flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between">
	<!-- Search input -->
	<div class="w-full md:w-auto">
		<Input
			placeholder="Filter tasks..."
			class="h-8 w-full md:w-[150px] lg:w-[250px]"
			type="search"
			bind:value={$filterValue}
		/>
	</div>
	
	<!-- Filters container -->
	<div class="flex flex-wrap items-center gap-2">
		<DataTableFacetedFilter
			bind:filterValues={$filterValues.status}
			title="Status"
			options={statuses}
			counts={counts.status}
		/>
		<DataTableFacetedFilter
			bind:filterValues={$filterValues.priority}
			title="Priority"
			options={priorities}
			counts={counts.priority}
		/>
		{#if showReset}
			<Button
				onclick={() => {
					$filterValue = '';
					$filterValues.status = [];
					$filterValues.priority = [];
				}}
				variant="ghost"
				class="h-8 px-2 lg:px-3"
			>
				Reset
				<Cross2 class="ml-2 h-4 w-4" />
			</Button>
		{/if}
		<div class="ml-auto">
			<DataTableViewOptions {tableModel} />
		</div>
	</div>
</div>