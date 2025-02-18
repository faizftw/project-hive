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
	import { writable, derived } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { tasksStore } from '$lib/stores/tasks';

	export let data: {
		projects: Project[];
		tasks: Task[];
		tag: string;
		PageData: PageData;
	};

	// Initialize store with data from server
	$: {
		if (data.projects) {
			console.log('Initial projects data:', data.projects); // Debug log
			const validProjects = data.projects.filter(p => p && p.id);
			projectsStore.set(validProjects);
		}
		if (data.tasks) {
			tasksStore.set(data.tasks);
		}
	}

	const searchQuery = writable('');

	// Store yang terfilter berdasarkan kata kunci pencarian
	const filteredProjects = derived(
		[projectsStore, searchQuery],
		([$projectsStore, $searchQuery]) => {
			if (!$searchQuery) return $projectsStore;
			return $projectsStore.filter(project =>
				project.name.toLowerCase().includes($searchQuery.toLowerCase())
			);
		}
	);

	// Reactive statements untuk metrics
	$: totalProjects = $projectsStore.length;
	$: completedProjects = $projectsStore.filter(p => p.status === 'completed').length;
	$: inProgressProjects = $projectsStore.filter(p => p.status === 'active').length;
	$: overdueProjects = $projectsStore.filter(p => {
		if (p.dueDate && p.status !== 'completed') {
			return new Date(p.dueDate) < new Date();
		}
		return false;
	}).length;
	$: cancelledProjects = $projectsStore.filter(p => p.status === 'cancelled').length;
	$: onHoldProjects = $projectsStore.filter(p => p.status === 'on-hold').length;

	async function handleProjectAdded(event: CustomEvent<{data: Project}>) {
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

	const taskData: Task[] = [];

	function handleSearch(event: CustomEvent<string>) {
		searchQuery.set(event.detail);
	}
</script>

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
	<!-- buat card project -->
	<div class="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
		{#each $filteredProjects as project (project.id)}
			<div transition:fade>
				<ProjectCard {project} />
			</div>
		{/each}
	</div>
</div>
