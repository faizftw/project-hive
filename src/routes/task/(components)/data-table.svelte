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
	import { refreshTableData as fetchTableData } from '$lib/utils/table-utils';

	export let projectId: string;

	let isLoading = true;
	let errorMessage = '';

	// Fungsi untuk mengambil data dari server
	async function refreshTableData() {
		if (!browser) return;
		
		isLoading = true;
		errorMessage = '';
		
		try {
			console.log('DataTable refreshing data untuk projectId:', projectId);
			
			// Gunakan fungsi refreshTableData dari utils
			const tasks = await fetchTableData(projectId);
			
			if (!tasks || tasks.length === 0) {
				console.log('Tidak ada task yang dikembalikan, tetapi tidak error');
			}
			
		} catch (error: any) {
			console.error('Error refreshing data di komponen:', error);
			errorMessage = error.message || 'Gagal memperbarui data';
			toast.error(errorMessage);
		} finally {
			isLoading = false;
		}
	}

	let unsubscribe: () => void;
	
	onMount(async () => {
		console.log('DataTable mounted with projectId:', projectId);
		
		// Jalankan fetch data saat component di-mount
		await refreshTableData();
		
		// Aktifkan subscription untuk memantau perubahan store tasks
		unsubscribe = tasksStore.subscribe(tasks => {
			console.log(`Tasks store updated: ${tasks.length} items`);
			isLoading = false; // Pastikan loading selesai saat data diupdate
		});
	});
	
	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	// Buat derived store untuk memfilter task berdasarkan projectId
	const filteredTasks = derived(tasksStore, $tasks => {
		const filtered = $tasks.filter(task => task.projectId === projectId);
		return filtered;
	});

	// Gunakan filteredTasks untuk tabel
	const table = createTable(filteredTasks, {
		select: addSelectedRows(),
		sort: addSortBy({
			toggleOrder: ['asc', 'desc']
		}),
		page: addPagination({
			initialPageSize: 10
		}),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => {
				if (value === null || value === undefined) return false;
				return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
			}
		}),
		colFilter: addColumnFilters(),
		hide: addHiddenColumns({
			initialHiddenColumnIds: ['createdAt']
		})
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
			header: 'Judul',
			id: 'title',
			cell: ({ value, row }) => {
				if (row.isData()) {
					const labelValue = row.original.label;
					return createRender(DataTableTitleCell, {
						labelValue,
						value
					});
				}
				return value;
			},
		}),
		table.column({
			accessor: 'description',
			header: 'Deskripsi',
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
			header: 'Prioritas',
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
			header: 'Deadline',
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
						row: row.original,
						projectId
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
{:else if errorMessage}
	<div class="p-8 text-center">
		<div class="text-red-500 font-semibold mb-2">Error:</div>
		<div>{errorMessage}</div>
		<button 
			class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
			on:click={refreshTableData}
		>
			Try Again
		</button>
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
								{#if $filteredTasks.length === 0}
									Belum ada tugas di proyek ini
								{:else}
									Tidak ada tugas yang sesuai dengan filter
								{/if}
							</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
		</div>
		<DataTablePagination {tableModel} />
	</div>
{/if}