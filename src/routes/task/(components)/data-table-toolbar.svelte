<script lang="ts">
	import type { TableViewModel } from 'svelte-headless-table';
	import Cross2 from 'svelte-radix/Cross2.svelte';
	import type { Writable } from 'svelte/store';
	import { priorities, statuses } from '../(data)/data.js';
	import type { Task } from '../(data)/schemas.js';
	import { DataTableFacetedFilter, DataTableViewOptions, AddTask } from './index.js';
	import {Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	interface Props {
		tableModel: TableViewModel<Task>;
		data?: Task[]; // Nilai default array kosong
		projectId: string;
	}

	let { tableModel, data = [], projectId }: Props = $props();


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

	let showReset = $derived(Object.values({ ...$filterValues, $filterValue }).some((v) => v.length > 0));
</script>

<div class="flex items-center justify-between">
	<div class="flex flex-1 items-center space-x-2">
		<Input
			placeholder="Filter tasks..."
			class="h-8 w-[150px] lg:w-[250px]"
			type="search"
			bind:value={$filterValue}
		/>

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
	</div>
	<AddTask projectId={projectId}/>
	<DataTableViewOptions {tableModel} />
</div>