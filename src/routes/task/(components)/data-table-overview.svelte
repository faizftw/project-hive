<script lang="ts">
	import { readable, get, derived, writable } from 'svelte/store';
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
	import { onDestroy, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
import { CrossCircled } from 'svelte-radix';
import * as Alert from '$lib/components/ui/alert/index.js';
	import { projectsStore } from '$lib/stores/projects';
	import { browser } from '$app/environment';
	import { tasksOverviewStore } from '$lib/stores/tasks-overview';

	export let activeTab: string;

	let isLoading = false;
let errorMessage = '';
let showAlert = false;

	async function refreshTableData() {
		if (!browser) return; // Jangan jalankan di server

		isLoading = true;
		try {
			// Reset store terlebih dahulu untuk mencegah data lama tercampur
			tasksOverviewStore.reset();
			
			// Ambil semua tugas tanpa filter projectId
			const response = await fetch(`/api/tasks`);
			const tasks = await response.json();
			// console.log(`Berhasil mengambil ${tasks.length} tasks dari API`);
			
			// Set data baru ke store
			tasksOverviewStore.set(tasks);
		} catch (error) {
			// console.error('Error refreshing data:', error);
			errorMessage = 'Gagal memperbarui data';
showAlert = true;
		} finally {
			isLoading = false;
		}
	}

	// Buat writable store dari activeTab prop
	const activeTabStore = writable(activeTab);

	// Pindahkan fetch ke dalam onMount dan tambahkan efek untuk memantau perubahan tab dan projects
	onMount(() => {
		refreshTableData();
		
		// Tambahkan efek untuk memantau perubahan activeTab
		const unsubscribeTab = activeTabStore.subscribe((currentTab) => {
			// console.log(`Tab berubah menjadi: ${currentTab}`);
			// Refresh data saat tab berubah untuk memastikan data selalu konsisten
			refreshTableData();
		});
		
		// Tambahkan efek untuk memantau perubahan projectsStore
		// Ini akan mendeteksi saat project dihapus dari dashboard
		const unsubscribeProjects = projectsStore.subscribe(() => {
			// console.log('Projects store berubah, refresh data tabel overview');
			refreshTableData();
		});
		
		return () => {
			unsubscribeTab();
			unsubscribeProjects();
		};
	});

	// Update activeTabStore saat prop activeTab berubah
	$: activeTabStore.set(activeTab);

	// Tambahkan onDestroy untuk membersihkan store saat navigasi halaman
	onDestroy(() => {
		// Reset store untuk mencegah data tertukar saat navigasi
		tasksOverviewStore.reset();
		// console.log('tasksOverviewStore direset saat navigasi halaman');
	});

	const allTasks = derived(tasksOverviewStore, $tasks => $tasks);

	// Derived store untuk task yang difilter berdasarkan tab
	const filteredAndSortedTasks = derived(
		[tasksOverviewStore, projectsStore, activeTabStore], 
		([$tasks, $projects, currentTab]) => {
			// console.log(`Memfilter tasks untuk tab: ${currentTab}, jumlah tasks: ${$tasks.length}`);
			
			// Filter task yang projectnya masih ada
			const validTasks = $tasks.filter((task: any) => {
				const projectIds = new Set($projects.map((p: any) => p.id));
				return projectIds.has(task.projectId);
			});

			if (currentTab === 'Upcoming') {
				// Filter task yang belum selesai dan urutkan berdasarkan deadline terdekat
				const filteredTasks = validTasks
					.filter((task: any) => 
						task.status !== 'Completed' && 
						task.status !== 'Canceled' && 
						task.deadline
					)
					.sort((a: any, b: any) => 
						new Date(a.deadline || '').getTime() - new Date(b.deadline || '').getTime()
					)
					.slice(0, 5); // Ambil 5 task terdekat
				
				// console.log(`Tab Upcoming: ${filteredTasks.length} tasks setelah filter`);
				return filteredTasks;
			} else {
				// Urutkan berdasarkan createdAt terbaru
				const filteredTasks = validTasks
					.sort((a: any, b: any) => 
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					)
					.slice(0, 5); // Ambil 5 task terbaru
				
				// console.log(`Tab Recent: ${filteredTasks.length} tasks setelah filter`);
				return filteredTasks;
			}
		}
	);

	// Pastikan filteredAndSortedTasks mengembalikan array yang valid untuk createTable
	const typedFilteredTasks = derived(filteredAndSortedTasks, ($tasks): any[] => {
		return Array.isArray($tasks) ? $tasks : [];
	});

	// Gunakan typedFilteredTasks untuk tabel dengan konfigurasi yang lebih stabil
	// Buat tabel dengan derived store untuk memastikan tabel selalu diperbarui dengan data terbaru
	const table = createTable(typedFilteredTasks, {
		select: addSelectedRows(),
		sort: addSortBy({
			toggleOrder: ['asc', 'desc']
		}),
		page: addPagination({
			initialPageIndex: 0, // Selalu mulai dari halaman pertama
			initialPageSize: 5 // Sesuaikan dengan jumlah item yang ditampilkan
		}),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => {
				if (typeof value !== 'string') return true;
				return value.toLowerCase().includes(filterValue.toLowerCase());
			},
			initialFilterValue: ''
		}),
		colFilter: addColumnFilters(),
		hide: addHiddenColumns()
	});

	const columns = table.createColumns([
		table.column({
			accessor: 'projectId',
			header: 'Proyek',
			id: 'projectId',
			cell: ({ value }) => {
				return createRender(DataTableProjectCell, {
					projectId: value
				});
			}
		}),
		table.column({
			accessor: 'title',
			header: 'Judul',
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
						return filterValue.includes(value);
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
						return filterValue.includes(value);
					},
					initialFilterValue: [],
					render: ({ filterValue }) => {
						return get(filterValue);
					}
				}
			}
		}),
	]);

	// Tambahkan kolom deadline untuk tab Upcoming
	if (activeTab === 'Upcoming') {
		columns.push(
			table.column({
				accessor: 'deadline',
				header: 'Deadline',
				id: 'deadline',
				cell: ({ value }) => {
					return createRender(DataTableDeadline, { deadline: value });
				}
			})
		);
	} 
	// Tambahkan kolom createdAt untuk tab Recent
	else if (activeTab === 'Recent') {
		columns.push(
			table.column({
				accessor: 'createdAt',
				header: 'Created At',
				id: 'createdAt',
				cell: ({ value }) => {
					const date = new Date(value || '');
					return date.toLocaleDateString('id-ID', {
						year: 'numeric',
						month: 'short',
						day: '2-digit',
						hour: '2-digit',
						minute: '2-digit'
					});
				}
			})
		);
	}

	const tableModel = table.createViewModel(columns);
	const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = tableModel;

</script>

<div class="space-y-4">
	<OverviewToolbar {tableModel} data={$allTasks} />
	{#if showAlert}
	<Alert.Root variant="destructive">
		<CrossCircled class="h-4 w-4" />
		<Alert.Title>Error</Alert.Title>
		<Alert.Description>{errorMessage}</Alert.Description>
	</Alert.Root>
{/if}
<div class="rounded-md border">
		<Table.Root {...$tableAttrs} class="w-full">
			<Table.Header class="bg-muted/50">
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row class="hover:bg-muted/50">
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
			<Table.Body {...$tableBodyAttrs} class="divide-y divide-border">
				{#if $pageRows.length}
					{#each $pageRows as row (row.id)}
						<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
							<Table.Row {...rowAttrs} class="hover:bg-muted/50">
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
					<Table.Row class="hover:bg-muted/50">
						<Table.Cell colspan={columns.length} class="h-24 text-center">
							Tidak ada hasil.
						</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</div>
