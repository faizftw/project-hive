<script lang="ts">
	import { AddProject, Search, DarkMode, Avatar } from './(components)/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { FolderCheck, FolderClock, CalendarClock, FolderX, CirclePause, FolderOpen } from 'lucide-svelte';
	import DataTableOverview from '../task/(components)/data-table-overview.svelte';
	import type { Task } from '../task/(data)/schemas.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import ProjectCard from './(components)/project-card.svelte';
	import type { Project, PageData } from '$lib/types';
	import { projectsStore } from '$lib/stores/projects';
	import { tasksStore } from '$lib/stores/tasks';
	import { fade } from 'svelte/transition';

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
</script>

<!-- 7. Add loading state -->
{#if !data}
	<div class="flex-1 space-y-4 p-8 pt-6">
		<p>Loading...</p>
	</div>
{:else if $projectsStore.length === 0}
	<div class="flex-1 space-y-4 p-8 pt-6">
		<p>No projects found. Create your first project!</p>
		<AddProject on:projectAdded={handleProjectAdded} />
	</div>
{:else}
	<div class="flex-1 space-y-4 p-8 pt-6">
		<div class="flex items-center justify-between space-y-2">
			<h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
			<div class="flex items-center space-x-2">
				<Avatar />
				<DarkMode />
				<AddProject on:projectAdded={handleProjectAdded} />
				<Search on:search={handleSearch} />
			</div>
		</div>
		<div class="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Projects</Card.Title>
					<FolderOpen class="text-muted-foreground h-4 w-4" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{totalProjects}</div>
					<p class="text-muted-foreground text-xs">Total Projects</p>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Completed</Card.Title>
					<FolderCheck class="text-muted-foreground h-4 w-4" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{completedProjects}</div>
					<p class="text-muted-foreground text-xs">Completed Projects</p>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">In Progress</Card.Title>
					<FolderClock class="text-muted-foreground h-4 w-4" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{inProgressProjects}</div>
					<p class="text-muted-foreground text-xs">Active Projects</p>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Overdue</Card.Title>
					<CalendarClock class="text-muted-foreground h-4 w-4" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{overdueProjects}</div>
					<p class="text-muted-foreground text-xs">Overdue Projects</p>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Archived</Card.Title>
					<FolderX class="text-muted-foreground h-4 w-4" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{cancelledProjects}</div>
					<p class="text-muted-foreground text-xs">Archived Projects</p>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">On Hold</Card.Title>
					<CirclePause class="text-muted-foreground h-4 w-4" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{onHoldProjects}</div>
					<p class="text-muted-foreground text-xs">On Hold Projects</p>
				</Card.Content>
			</Card.Root>
		</div>
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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
		<Separator />
		<div class="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
			{#each filteredProjects as project (project.id)}
				<div transition:fade>
					<ProjectCard project={project as Project} />
				</div>
			{/each}
		</div>
	</div>
{/if}