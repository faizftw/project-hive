<script lang="ts">
	import { readable, get, derived } from 'svelte/store';
	import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table';
	import {
		addColumnFilters,
		addHiddenColumns,
		addPagination,
		addSelectedRows,
		addSortBy,
		addTableFilter
	} from 'svelte-headless-table/plugins';
	import {
		DataTableColumnHeader,
		DataTablePagination,
		DataTablePriorityCell,
		DataTableRowActions,
		DataTableStatusCell,
		DataTableTitleCell,
		DataTableToolbar,
		DataTableDescCell,
		DataTableDeadline,
		DataTableUrlCell
	} from './index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { tasksStore } from '$lib/stores/tasks';
	import { onDestroy, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	export let projectId: string;

	let isLoading = false;

	async function refreshTableData(projectId?: string) {
		isLoading = true;
		try {
			const url = projectId ? `/api/tasks?projectId=${projectId}` : '/api/tasks';
			const response = await fetch(url);
			const tasks = await response.json();
			tasksStore.set(tasks);
		} catch (error) {
			console.error('Error refreshing data:', error);
			toast.error('Gagal memperbarui data');
		} finally {
			isLoading = false;
		}
	}

	// Subscribe ke event taskAdded dan taskUpdated
	const unsubscribe = tasksStore.subscribe(() => {
		refreshTableData();
	});

	onDestroy(() => {
		unsubscribe();
	});

	// Buat derived store untuk memfilter task berdasarkan projectId
	const filteredTasks = derived(tasksStore, $tasks => 
		$tasks.filter(task => task.projectId === projectId)
	);

	// Pindahkan fetch ke onMount
	onMount(async () => {
		if (browser) {
			await refreshTableData($page.params.projectId);
		}
	});

	// Gunakan filteredTasks untuk tabel
	const table = createTable(filteredTasks, {
		select: addSelectedRows(),
		sort: addSortBy({
			toggleOrder: ['asc', 'desc']
		}),
		page: addPagination(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => {
				return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
			}
		}),
		colFilter: addColumnFilters(),
		hide: addHiddenColumns()
	});

	const columns = table.createColumns([
		table.column({
			accessor:'id',
			header: () => 'Task',
			id: 'task',
			cell: ({ value }) => {
				const truncate = (str: string, length: number) => {
					return str.length > length ? str.substring(0, length) + '...' : str;
				};
				return 'Task - ' + truncate(value, 5); 
			},
			plugins: {
				sort: {
					disable: true
				}
			}
		}),
		table.column({
			accessor: 'title',
			header: 'Title',
			id: 'title',
			cell: ({ value, row }) => {
				if (row.isData()) {
					
					return createRender(DataTableTitleCell, {
						labelValue: row.original.label,
						value
					});
				}
				return value;

			},
		}),
		table.column({
			accessor: 'description',
			header: 'Description',
			id: 'description',
			cell: ({ value }) => {
				return createRender(DataTableDescCell, { description: value });
			}
		}),
		table.column({
			accessor: 'url',
			header: 'URL',
			id: 'url',
			cell: ({ value }) => {
				return createRender(DataTableUrlCell, { url: value });
			}
		}),
		table.column({
			accessor: 'status',
			header: 'Status',
			id: 'status',
			cell: ({ value }) => {
				return createRender(DataTableStatusCell, {
					value
				});
			},
			plugins: {
				colFilter: {
					fn: ({ filterValue, value }) => {
						if (filterValue.length === 0) return true;
						if (!Array.isArray(filterValue) || typeof value !== 'string') return true;
						return filterValue.some((filter) => value.includes(filter));
					},
					initialFilterValue: [],
					render: ({ filterValue }) => {
						return get(filterValue);
					}
				}
			}
		}),
		table.column({
			accessor: 'priority',
			id: 'priority',
			header: 'Priority',
			cell: ({ value }) => {
				return createRender(DataTablePriorityCell, {
					value
				});
			},
			plugins: {
				colFilter: {
					fn: ({ filterValue, value }) => {
						if (filterValue.length === 0) return true;
						if (!Array.isArray(filterValue) || typeof value !== 'string') return true;
						return filterValue.some((filter) => value.includes(filter));
					},
					initialFilterValue: [],
					render: ({ filterValue }) => {
						return get(filterValue);
					}
				}
			}
		}),
		table.column({
			accessor: 'deadline',
			header: 'Due',
			id: 'deadline',
			cell: ({ value }) => {
				return createRender(DataTableDeadline, { deadline: value });
			}
		}),
		table.display({
			id: 'actions',
			header: () => '',
			cell: ({ row }) => {
				if (row.isData() && row.original) {
					return createRender(DataTableRowActions, {
						row: row.original
					});
				}
				return '';
			}
		})
	]);
	
	const tableModel = table.createViewModel(columns);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = tableModel;
</script>

{#if isLoading}
	<div class="w-full space-y-3">
		{#each Array(5) as _}
			<div class="flex items-center space-x-4 rounded-md border p-4">
				<div class="h-6 w-[30%] animate-pulse rounded-md bg-muted"></div>
				<div class="h-6 w-[15%] animate-pulse rounded-md bg-muted"></div>
				<div class="h-6 w-[15%] animate-pulse rounded-md bg-muted"></div>
				<div class="h-6 w-[15%] animate-pulse rounded-md bg-muted"></div>
			</div>
		{/each}
	</div>
{:else}
	<div class="space-y-4">
		<DataTableToolbar {tableModel} {projectId} data={$filteredTasks} />
		<div class="rounded-md border">
			<Table.Root {...$tableAttrs}>
				<Table.Header>
					{#each $headerRows as headerRow}
						<Subscribe rowAttrs={headerRow.attrs()}>
							<Table.Row>
								{#each headerRow.cells as cell (cell.id)}
									<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
										<Table.Head {...attrs}>
											{#if cell.id !== 'select' && cell.id !== 'actions'}
												<DataTableColumnHeader props={props} {tableModel} cellId={cell.id}>
													<Render of={cell.render()} />
												</DataTableColumnHeader>
											{:else}
												<Render of={cell.render()} />
											{/if}
										</Table.Head>
									</Subscribe>
								{/each}
							</Table.Row>
						</Subscribe>
					{/each}
				</Table.Header>
				<Table.Body {...$tableBodyAttrs}>
					{#if $pageRows.length}
						{#each $pageRows as row (row.id)}
							<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
								<Table.Row {...rowAttrs}>
									{#each row.cells as cell (cell.id)}
										<Subscribe attrs={cell.attrs()} let:attrs>
											<Table.Cell {...attrs}>
												<Render of={cell.render()} />
											</Table.Cell>
										</Subscribe>
									{/each}
								</Table.Row>
							</Subscribe>
						{/each}
					{:else}
						<Table.Row>
							<Table.Cell colspan={columns.length} class="h-24 text-center">
								No Task found
							</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
		</div>
		<DataTablePagination {tableModel} />
	</div>
{/if}
