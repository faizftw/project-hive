<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import GalleryVerticalEnd from 'lucide-svelte/icons/gallery-vertical-end';
	import { projectsStore } from '$lib/stores/projects';
	import { tasksStore } from '$lib/stores/tasks';
	import { getLocalTimeZone, today, parseDate, CalendarDate } from "@internationalized/date";
	import { RangeCalendar } from "$lib/components/ui/range-calendar/index.js";
	import type { ComponentProps } from 'svelte';
	import { formatDate } from "date-fns";
	import { onMount } from 'svelte';
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { derived } from 'svelte/store';

	let {
		ref = $bindable(null),
		projectId,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { projectId: string } = $props();

	// Derived store untuk menghitung jumlah task berdasarkan status
	const taskCounts = derived(tasksStore, ($tasks) => {
		const counts = {
			backlog: 0,
			todo: 0,
			inProgress: 0,
			completed: 0,
			cancelled: 0,
			pending: 0,
			overdue: 0
		};

		$tasks
			.filter(task => task.projectId === projectId)
			.forEach(task => {
				switch (task.status) {
					case 'Backlog':
						counts.backlog++;
						break;
					case 'Todo':
						counts.todo++;
						break;
					case 'In Progress':
						counts.inProgress++;
						break;
					case 'Completed':
						counts.completed++;
						break;
					case 'Canceled':
						counts.cancelled++;
						break;
					case 'Pending':
						counts.pending++;
						break;
					case 'Overdue':
						counts.overdue++;
						break;
				}
			});

		return counts;
	});

	// Start date adalah hari ini
	const start = today(getLocalTimeZone());
	
	// Inisialisasi value dengan default
	let value = $state({
		start: start,
		end: start // Default ke start, akan diupdate saat project ditemukan
	});
	
	let endDate: CalendarDate | null = null;
	let initializing = true;
	
	// Fungsi untuk memperbarui end date tanpa menyebabkan loop reaktivitas
	function updateEndDate(date: CalendarDate) {
		console.log("Memperbarui end date ke:", date);
		endDate = date;
		// Buat objek baru untuk value tetapi hanya sekali saat inisialisasi
		// atau saat end date benar-benar berubah
		if (initializing) {
			initializing = false;
			setTimeout(() => {
				value = {
					start: start,
					end: date
				};
				console.log("Nilai range calendar diinisialisasi:", value);
			}, 0);
		} else {
			// Untuk update selanjutnya, langsung ubah properti end
			value.end = date;
			console.log("Nilai range calendar diperbarui:", value);
		}
	}

	// Gunakan derived store untuk mendapatkan project dan title secara reaktif
	const currentProject = derived(projectsStore, ($projects) => {
		console.log("Mencari project dengan ID:", projectId, "dari", $projects.length, "projects");
		return $projects.find(p => p.id === projectId) || null;
	});
	
	// Title akan otomatis diperbarui saat project berubah
	let title = $state('');
	
	// Gunakan $effect untuk memperbarui title saat project berubah
	$effect(() => {
		title = $currentProject?.name || '';
	});
	
	// Menggunakan $effect untuk memperbarui tanggal deadline proyek secara reaktif
	$effect(() => {
		const project = $currentProject;
		if (!project) {
			console.log("Tidak ada project yang ditemukan");
			return;
		}
		
		console.log("Project ditemukan:", project);
		
		if (project.dueDate) {
			try {
				console.log("Project dueDate:", project.dueDate);
				const date = new Date(project.dueDate);
				const dateStr = date.toISOString().split('T')[0];
				console.log("Due date string:", dateStr);
				
				const parsedDate = parseDate(dateStr);
				console.log("End date parsed:", parsedDate);
				
				// Update hanya jika tanggal berubah (bukan string comparison)
				if (!endDate || 
					endDate.year !== parsedDate.year || 
					endDate.month !== parsedDate.month || 
					endDate.day !== parsedDate.day) {
					
					updateEndDate(parsedDate);
				}
			} catch (error) {
				console.error('Error memproses project deadline:', error);
			}
		} else {
			console.log("Project tidak memiliki due date");
		}
	});
	
	// Tetap gunakan onMount untuk memastikan inisialisasi awal
	onMount(() => {
		console.log("Component mounted, projectId:", projectId);
		// Tidak perlu lagi mencari project secara manual karena sudah ditangani oleh derived store
	})
</script>

<Sidebar.Root variant="floating" {...restProps}>
	<Sidebar.Header class="p-4">
		<h2 class="text-2xl font-bold tracking-tight">Detail Proyek</h2>
	</Sidebar.Header>
	
	<Sidebar.Content class="p-4">
		<Sidebar.Group class="mb-4">
			<h3 class="text-xl font-bold tracking-tight">{title || 'Tidak ada judul'}</h3>
			<p class="text-sm text-muted-foreground">{$currentProject?.description || 'Tidak ada deskripsi'}</p>
		</Sidebar.Group>
		<Sidebar.Group class="mb-4">
			<div class="space-y-4">
				<div class="justify-items-center">
					<h4 class="text-lg text-center font-bold text-muted-foreground mb-2">Deadline Proyek</h4>
					<RangeCalendar 
						bind:value 
						class="rounded-md border inline-block" 
						readonly={true}
						disabled={true}
						locale="en"
					/>
				</div>
				
				<div>
					<h4 class="text-lg text-center font-bold text-muted-foreground mb-2">Status Tugas</h4>
					<div class="flex flex-wrap gap-1">
						<Badge href="#" class="badge" variant="outline">Backlog {$taskCounts.backlog}</Badge>
						<Badge href="#" class="badge" variant="outline">Todo {$taskCounts.todo}</Badge>
						<Badge href="#" class="badge" variant="outline">In Progress {$taskCounts.inProgress}</Badge>
						<Badge href="#" class="badge" variant="outline">Completed {$taskCounts.completed}</Badge>
						<Badge href="#" class="badge" variant="outline">Cancelled {$taskCounts.cancelled}</Badge>
						<Badge href="#" class="badge" variant="outline">Pending {$taskCounts.pending}</Badge>
						<Badge href="#" class="badge" variant="outline">Overdue {$taskCounts.overdue}</Badge>
					</div>
				</div>
			</div>
		</Sidebar.Group>
	</Sidebar.Content>
</Sidebar.Root>