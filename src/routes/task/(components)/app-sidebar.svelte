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

	const project = $projectsStore.find(p => p.id === projectId);
	let title = project?.name;
	
	// Menggunakan onMount untuk inisialisasi pertama
	onMount(() => {
		if (!projectId) return;
		
		const findProject = () => {
			console.log("Mencari project dengan ID:", projectId);
			const project = $projectsStore.find(p => p.id === projectId);
			console.log("Project yang ditemukan:", project);
			
			if (project?.dueDate) {
				try {
					console.log("Project dueDate:", project.dueDate);
					const date = new Date(project.dueDate);
					const dateStr = date.toISOString().split('T')[0];
					console.log("Due date string:", dateStr);
					
					const parsedDate = parseDate(dateStr);
					console.log("End date parsed:", parsedDate);
					
					updateEndDate(parsedDate);
				} catch (error) {
					console.error('Error memproses project deadline:', error);
				}
			} else {
				console.log("Project tidak memiliki due date");
			}
		};
		
		// Coba cari project setelah komponen di-mount
		findProject();
		
		// Coba lagi setelah beberapa saat jika project store belum diisi
		setTimeout(findProject, 500);
	});
	
	// Mencari project dan mengupdate end date saat projectId berubah
	$effect(() => {
		if (initializing || !projectId) return;
		
		console.log("Project ID berubah:", projectId);
		const project = $projectsStore.find(p => p.id === projectId);
		
		if (project?.dueDate) {
			try {
				const date = new Date(project.dueDate);
				const dateStr = date.toISOString().split('T')[0];
				const parsedDate = parseDate(dateStr);
				
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
		}
	});
</script>

<Sidebar.Root variant="floating" {...restProps}>
	<Sidebar.Header class="p-4">
		<h2 class="text-2xl font-bold tracking-tight">Project Details</h2>
	</Sidebar.Header>
	
	<Sidebar.Content class="p-4">
		<Sidebar.Group>
			<h3 class="text-xl font-bold tracking-tight">{title}</h3>
			<p class="text-sm text-muted-foreground">{project?.description || 'No description'}</p>
		</Sidebar.Group>
		<Sidebar.Group>
		<div class="space-y-4">
			<div>
				<h4 class="text-lg text-center font-bold text-muted-foreground mb-2">Project Deadline</h4>
				<RangeCalendar 
					bind:value 
					class="rounded-md border" 
					readonly={true}
					disabled={true}
					locale="en"
				/>
			</div>
			
			<div>
				<h4 class="text-lg text-center font-bold text-muted-foreground mb-2">Task Status</h4>
				<div class="flex flex-wrap gap-2">
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