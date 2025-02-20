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
		OverviewToolbar,
		DataTableDescCell,
		DataTableDeadline,
		DataTableProjectCell,
		DataTableUrlCell
	} from './index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { tasksStore } from '$lib/stores/tasks';
	import { onDestroy, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { projectsStore } from '$lib/stores/projects';

	export let projectId: string;
	export let activeTab: string;

	let isLoading = false;

	async function refreshTableData() {
		isLoading = true;
		try {
			const response = await fetch(`/api/tasks?projectId=${projectId}`);
			const tasks = await response.json();
			tasksStore.set(tasks);
		} catch (error) {
			console.error('Error refreshing data:', error);
			toast.error('Gagal memperbarui data');
		} finally {
			isLoading = false;
		}
	}

	// Pindahkan subscribe ke dalam onMount
	onMount(() => {
		// Panggil refreshTableData pertama kali
		if (projectId) {
			refreshTableData();
		}

		// Subscribe ke perubahan store
		const unsubscribe = tasksStore.subscribe(() => {
			if (projectId) {
				refreshTableData();
			}
		});

		// Cleanup subscription saat komponen dihapus
		return () => {
			unsubscribe();
		};
	});

	const allTasks = derived(tasksStore, $tasks => $tasks);

	// Derived store untuk task yang difilter berdasarkan tab
	const filteredAndSortedTasks = derived(
		[tasksStore, projectsStore], 
		([$tasks, $projects]) => {
			// Filter task yang projectnya masih ada
			const validTasks = $tasks.filter(task => {
				const projectIds = new Set($projects.map(p => p.id));
				return projectIds.has(task.projectId);
			});

			if (activeTab === 'Upcoming') {
				// Filter task yang belum selesai dan urutkan berdasarkan deadline terdekat
				return validTasks
					.filter(task => 
						task.status !== 'Completed' && 
						task.status !== 'Canceled' && 
						task.deadline
					)
					.sort((a, b) => 
						new Date(a.deadline || '').getTime() - new Date(b.deadline || '').getTime()
					)
					.slice(0, 5); // Ambil 5 task terdekat
			} else {
				// Urutkan berdasarkan createdAt terbaru
				return validTasks
					.sort((a, b) => 
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					)
					.slice(0, 5); // Ambil 5 task terbaru
			}
		}
	);

	// Gunakan filteredAndSortedTasks untuk tabel
	const table = createTable(filteredAndSortedTasks, {
		select: addSelectedRows(),
		sort: addSortBy({
			toggleOrder: ['asc', 'desc']
		}),
		page: addPagination(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => {
				return value.toLowerCase().includes(filterValue.toLowerCase());
			}
		}),
		colFilter: addColumnFilters(),
		hide: addHiddenColumns()
	});

	const columns = table.createColumns([
		table.column({
			accessor: 'projectId',
			header: 'Project',
			id: 'projectId',
			cell: ({ value }) => {
				return createRender(DataTableProjectCell, {
					projectId: value
				});
			}
		}),
		table.column({
			accessor: 'title',
			header: 'Title',
			id: 'title',
			cell: ({ value, row }) => {
				if (row.isData()) {
					return createRender(DataTableTitleCell, {
						value,
						labelValue: row.original.label
					});
				}
				return value;
			}
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
						return filterValue.some((filter) => {
							return value.includes(filter);
						});
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

						return filterValue.some((filter) => {
							return value.includes(filter);
						});
					},
					initialFilterValue: [],
					render: ({ filterValue }) => {
						return get(filterValue);
					}
				}
			}
		}),
		table.column({
			accessor: activeTab === 'Upcoming' ? 'deadline' : 'createdAt',
			header: activeTab === 'Upcoming' ? 'Due' : 'Created At',
			id: activeTab === 'Upcoming' ? 'deadline' : 'createdAt',
			cell: ({ value }) => {
				if (activeTab === 'Upcoming') {
					return createRender(DataTableDeadline, { deadline: value });
				} else {
					const date = new Date(value);
					return date.toLocaleDateString('id-ID', {
						year: 'numeric',
						month: 'short',
						day: '2-digit',
						hour: '2-digit',
						minute: '2-digit'
					});
				}
			}
		}),
		table.display({
			id: 'actions',
			header: () => {
				return '';
			},
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

<div class="space-y-4">
	<OverviewToolbar {tableModel} data={$allTasks} />
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
							Tidak ada hasil.
						</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
	<DataTablePagination {tableModel} />
</div>
