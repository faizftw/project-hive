<script lang="ts">
	import { AddProject, Search, DarkMode, Avatar, NotificationBell } from './(components)/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { FolderCheck, FolderClock, CalendarClock, Archive, CirclePause, FolderOpen } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import DataTableOverview from '../task/(components)/data-table-overview.svelte';
	import type { Task } from '../task/(data)/schemas.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import ProjectCard from './(components)/project-card.svelte';
	import type { Project, PageData } from '$lib/types';
	import { projectsStore } from '$lib/stores/projects';
	import { tasksStore } from '$lib/stores/tasks';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	// 1. Tambahkan data prop dari server
	let { data } = $props<{
		data: {
			projects: Project[];
			tasks: Task[];
			tag: string;
		}
	}>();

	// 2. Inisialisasi state
	let searchQuery = $state('');

	// 3. Initialize stores dengan data dari server
	$effect(() => {
		console.log('Data from server:', data);
		
		if (data?.projects) {
			projectsStore.set(data.projects);
			console.log('Projects loaded into store:', data.projects);
		}
		
		if (data?.tasks) {
			tasksStore.set(data.tasks);
			console.log('Tasks loaded into store:', data.tasks);
			
			// Periksa task yang melewati deadline
			setTimeout(() => {
				tasksStore.checkOverdue();
			}, 500);
		}
	});

	// 4. Derived values
	let filteredProjects = $derived(
		searchQuery 
			? $projectsStore.filter((project: Project) =>
				project.name.toLowerCase().includes(searchQuery.toLowerCase())
			)
			: $projectsStore
	);

	// 5. Metrics calculations
	let totalProjects = $derived($projectsStore.length);
	let completedProjects = $derived($projectsStore.filter((p: Project) => p.status === 'completed').length);
	let inProgressProjects = $derived($projectsStore.filter((p: Project) => p.status === 'active').length);
	let overdueProjects = $derived(
		$projectsStore.filter((p: Project) => {
			if (p.dueDate && p.status !== 'completed') {
				return new Date(p.dueDate) < new Date();
			}
			return false;
		}).length
	);
	let cancelledProjects = $derived($projectsStore.filter((p: Project) => p.status === 'cancelled').length);
	let onHoldProjects = $derived($projectsStore.filter((p: Project) => p.status === 'on-hold').length);

	// 6. Debug logging
	$effect(() => {
		console.log('Current filtered projects:', filteredProjects);
		console.log('Total projects:', totalProjects);
		console.log('Store state:', $projectsStore);
	});

	// Event handlers
	function handleProjectAdded(event: CustomEvent<{data: Project}>) {
		try {
			const projectData = event.detail.data;
			console.log('Project added event data:', projectData);
			
			if (projectData?.id) {
				projectsStore.addProject(projectData);
			}
		} catch (err) {
			console.error('Error handling project added:', err);
		}
	}

	function handleSearch(event: CustomEvent<string>) {
		searchQuery = event.detail;
	}

	// Derived tasks data
	let taskData = $derived($tasksStore);

	// Jalankan pengecekan overdue tasks saat komponen dimuat
	onMount(() => {
		// Set interval untuk memeriksa status overdue secara berkala (setiap 1 jam)
		const interval = setInterval(() => {
			tasksStore.checkOverdue();
		}, 60 * 60 * 1000);
		
		return () => {
			clearInterval(interval);
		};
	});
</script>

	<div class="flex-0 space-y-4 p-8 pt-6">
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-2">
			<h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
			<div class="flex flex-row items-center gap-2">
				<NotificationBell />
				<Avatar/>
				<DarkMode />
				<AddProject on:projectAdded={handleProjectAdded} />
				<Search on:search={handleSearch} />
			</div>
		</div>
		<!-- Desktop view: cards, Mobile view: badges -->
		<div class="hidden sm:grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Proyek</Card.Title>
					<FolderOpen class="text-muted-foreground h-4 w-4" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{totalProjects}</div>
					<p class=" text-xs">Total Proyek</p>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Selesai</Card.Title>
					<FolderCheck class="text-green-500 h-4 w-4" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{completedProjects}</div>
					<p class="text-muted-foreground text-xs">Proyek Selesai</p>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Aktif</Card.Title>
					<FolderClock class="text-blue-500 h-4 w-4" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{inProgressProjects}</div>
					<p class="text-muted-foreground text-xs">Proyek Aktif</p>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Terlambat</Card.Title>
					<CalendarClock class="h-4 w-4 text-red-500" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{overdueProjects}</div>
					<p class="text-muted-foreground text-xs">Proyek Terlambat</p>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Arsip</Card.Title>
					<Archive class="text-slate-500 h-4 w-4" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{cancelledProjects}</div>
					<p class="text-muted-foreground text-xs">Proyek Arsip</p>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Tertunda</Card.Title>
					<CirclePause class="text-amber-500 h-4 w-4" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{onHoldProjects}</div>
					<p class="text-muted-foreground text-xs">Proyek Tertunda</p>
				</Card.Content>
			</Card.Root>
		</div>

		
		<div class="flex flex-wrap  gap-2 sm:hidden">
			<div class="flex items-center gap-1.5 bg-secondary/80 rounded-full px-3 py-1.5">
				<FolderOpen class="text-muted-foreground h-4 w-4" />
				<span class="font-semibold">{totalProjects}</span>
				<span class="text-xs text-muted-foreground">Proyek</span>
			</div>
			<div class="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full px-3 py-1.5">
				<FolderCheck class="h-4 w-4" />
				<span class="font-semibold">{completedProjects}</span>
				<span class="text-xs">Selesai</span>
			</div>
			<div class="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full px-3 py-1.5">
				<FolderClock class="h-4 w-4" />
				<span class="font-semibold">{inProgressProjects}</span>
				<span class="text-xs">Aktif</span>
			</div>
			<div class="flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full px-3 py-1.5">
				<CalendarClock class="h-4 w-4" />
				<span class="font-semibold">{overdueProjects}</span>
				<span class="text-xs">Terlambat</span>
			</div>
			<div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 rounded-full px-3 py-1.5">
				<Archive class="h-4 w-4" />
				<span class="font-semibold">{cancelledProjects}</span>
				<span class="text-xs">Arsip</span>
			</div>
			<div class="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full px-3 py-1.5">
				<CirclePause class="h-4 w-4" />
				<span class="font-semibold">{onHoldProjects}</span>
				<span class="text-xs">Tertunda</span>
			</div>
		</div>
		<div class="grid gap-4 grid-cols-7">
			<Card.Root class="col-span-7">
				<Card.Header>
					<Card.Title>Task Overview</Card.Title>
				</Card.Header>
				<Card.Content>
					<Tabs.Root value="Upcoming" class="w-full">
						<Tabs.List>
							<Tabs.Trigger value="Upcoming">Upcoming Deadline</Tabs.Trigger>
							<Tabs.Trigger value="Recent">Recent Task</Tabs.Trigger>
						</Tabs.List>
						<Tabs.Content value="Upcoming">
							<div class="w-full">
								<DataTableOverview data={taskData} activeTab="Upcoming" />
							</div>
						</Tabs.Content>
						<Tabs.Content value="Recent">
							<div class="w-full">
								<DataTableOverview data={taskData} activeTab="Recent" />
							</div>
						</Tabs.Content>
					</Tabs.Root>
				</Card.Content>
			</Card.Root>
		</div>
		
		
		<Separator class='' />
		<h2 class="text-2xl font-bold tracking-tight">Projects</h2>
		
		<div class="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each filteredProjects as project (project.id)}
				<div transition:fade>
					<ProjectCard project={project as Project} />
				</div>
			{/each}
		</div>
	</div>