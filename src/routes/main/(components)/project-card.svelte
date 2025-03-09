<script lang="ts">
	import { run } from 'svelte/legacy';

	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { Project } from '$lib/types';
	import { DotsHorizontal } from 'svelte-radix';
	import { Calendar, Clock, Edit, ExternalLink, ClockAlert, SquarePen, CircleCheck, AlertTriangle } from 'lucide-svelte';
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { Button } from '$lib/components/ui/button/index.js';
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { projectsStore } from '$lib/stores/projects';
	import EditProject from './edit-project.svelte';
	import { Progress } from "$lib/components/ui/progress/index.js";
	import { tasksStore } from '$lib/stores/tasks';
	import { derived } from 'svelte/store';
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { toast } from "svelte-sonner";

	interface Props {
		project: Project;
	}

	let { project = $bindable() }: Props = $props();

	let isDeleteDialogOpen = $state(false);
	let isEditDialogOpen = $state(false);

	// Variable declarations for calculated values
	let projectTasks = $state<any[]>([]);
	let computedStatus = $state<"active" | "completed" | "cancelled" | "on-hold">("active");
	let completedTasks = $state(0);
	let totalTasks = $state(0);
	let progressPercentage = $state(0);
	let isOverdue = $state(false);
	let daysRemaining = $state<number | null>(null);

	// Update project tasks when tasksStore changes
	$effect(() => {
		if (project?.id) {
			projectTasks = $tasksStore.filter(task => task.projectId === project.id);
		}
	});

	// Hitung status project
	function computeProjectStatus(
		tasks: any[],
		dueDate: string | null
	): "active" | "completed" | "cancelled" | "on-hold" {
		const now = new Date();
		
		// Rule 1: Jika deadline terlewat & tidak ada progress
		if (dueDate) {
			const due = new Date(dueDate);
			if (now > due) {
				const startedOrCompleted = tasks.filter(
					task => task.status === 'In Progress' || task.status === 'Completed'
				);
				if (startedOrCompleted.length === 0) {
					return "cancelled";
				}
			}
		}

		// Rule 2: Jika semua task completed
		if (tasks.length > 0 && tasks.every(task => task.status === 'Completed')) {
			return "completed";
		}

		// Rule 3: Jika tidak ada update selama 7 hari
		if (tasks.length > 0) {
			const latestTaskTime = Math.max(
				...tasks.map(task => new Date(task.createdAt).getTime())
			);
			if (now.getTime() - latestTaskTime > 7 * 24 * 60 * 60 * 1000) {
				return "on-hold";
			}
		}

		// Default: Active
		return "active";
	}

	// Status konfigurasi untuk badge dan label
	const statusConfig = {
		'active': { label: "Active", variant: "warning" },
		'completed': { label: "Completed", variant: "success" },
		'cancelled': { label: "Archived", variant: "error" },
		'on-hold': { label: "On Hold", variant: "info" },
	} as const;

	// Update computed values when relevant data changes
	$effect(() => {
		// Calculate computed status
		computedStatus = computeProjectStatus(projectTasks, project.dueDate);
		
		// Calculate completion metrics
		completedTasks = projectTasks.filter(task => task.status === 'Completed').length;
		totalTasks = projectTasks.length;
		progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
		
		// Check if project is overdue
		if (!project.dueDate || project.status === 'completed') {
			isOverdue = false;
		} else {
			const now = new Date();
			const dueDate = new Date(project.dueDate);
			isOverdue = now > dueDate;
		}
		
		// Calculate days remaining
		if (!project.dueDate) {
			daysRemaining = null;
		} else {
			const now = new Date();
			const dueDate = new Date(project.dueDate);
			daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
		}
	});

	// Update project status if needed
	$effect(() => {
		if (project && computedStatus !== project.status) {
			projectsStore.updateProject({
				...project,
				status: computedStatus
			});
		}
	});

	function formatDate(date: string | null) {
		if (!date) return 'Not set';
		
		try {
			const dateObj = new Date(date);
			
			if (isNaN(dateObj.getTime())) {
				console.error('Invalid date value:', date);
				return 'Not set';
			}

			return new Intl.DateTimeFormat('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
				hour12: true
			}).format(dateObj);
		} catch (err) {
			console.error('Error formatting date:', err);
			return 'Not set';
		}
	}

	async function handleDelete() {
		try {
			const formData = new FormData();
			formData.append('id', project.id);

			const response = await fetch('?/deleteProject', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.type === 'success') {
				// Hapus project dari store
				projectsStore.deleteProject(project.id);
				
				// Hapus semua task yang terkait dengan project yang dihapus
				tasksStore.deleteTask(project.id);
				
				isDeleteDialogOpen = false;
				toast.success('Project berhasil dihapus');
			} else {
				// Jika server mengembalikan error
				throw new Error(result.error || 'Gagal menghapus project');
			}
		} catch (err) {
			// Log error untuk debugging
			console.error('Error deleting project:', err);
			
			// Tampilkan pesan error yang lebih spesifik
			const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus project';
			toast.error(errorMessage);
			return;
		}
	}

	function handleProjectUpdated(event: CustomEvent<{project: Project}>) {
		const updatedProject = event.detail.project;
		
		// Validasi lengkap untuk semua field yang diperlukan
		if (!updatedProject?.id || 
			!updatedProject?.name || 
			!updatedProject?.createdBy?.id ||
			!updatedProject?.createdBy?.name ||
			!updatedProject?.createdBy?.email) {
			console.error('Invalid updated project data received:', updatedProject);
			return;
		}
		
		// Update local project dan store
		project = updatedProject;
		projectsStore.updateProject(updatedProject);
	}

	function handleCardClick() {
		goto(`/task?projectId=${project.id}`);
	}
</script>

{#if project && project.id}
	<Card.Root class="overflow-hidden transition-all hover:shadow-md">
		<Card.Header class="pb-2">
			<div class="flex items-start justify-between">
				<div class="space-y-1">
					<h3 class="text-xl font-semibold leading-none tracking-tight">{project.name || 'Untitled Project'}</h3>
					<Badge href="#" variant={statusConfig[project.status].variant} class="capitalize">
						{statusConfig[project.status].label}
					</Badge>
				</div>
				
				<div class="flex items-center gap-2">
					{#if isOverdue}
						<Badge href="#" variant="destructive" class="capitalize">
							Overdue
						</Badge>
					{/if}
					
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class="focus:outline-none">
							<Button variant="ghost" class="h-8 w-8 p-0">
								<DotsHorizontal class="h-4 w-4" />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="z-50" portalProps={{}}>
							<DropdownMenu.Group>
								<DropdownMenu.Item class="cursor-pointer" inset={false} onclick={() => isEditDialogOpen = true}>
									<Edit class="mr-2 h-4 w-4" />
									Edit
								</DropdownMenu.Item>
								<DropdownMenu.Item class="cursor-pointer" inset={false} onclick={() => isDeleteDialogOpen = true}>
									Delete
								</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</div>
		</Card.Header>
		
		<Card.Content class="space-y-4">
			<p class="text-sm text-muted-foreground line-clamp-2">{project.description || 'No description'}</p>
			
			<div class="space-y-1">
				<div class="flex justify-between text-xs text-muted-foreground">
					<span>Progress</span>
					<span>{progressPercentage}%</span>
				</div>
				<Progress value={progressPercentage} max={100} class="h-2" />
			</div>
			
			<div class="grid grid-cols-2 gap-2 text-xs">
				<div class="flex items-center gap-1 text-muted-foreground">
					<Calendar class="h-3 w-3" />
					<span>Created: {formatDate(project.createdAt)}</span>
				</div>
				<div class="flex items-center gap-1 text-muted-foreground">
					<Clock class="h-3 w-3" />
					<span>
						Due: {formatDate(project.dueDate)}
						{#if daysRemaining && daysRemaining > 0 && project.status !== 'completed'}
							<span class="ml-1 text-xs font-medium text-amber-600">
								({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left)
							</span>
						{/if}
					</span>
				</div>
			</div>
			
			<div class="text-muted-foreground text-xs flex items-center gap-1">
				{completedTasks}/{totalTasks} tasks completed
				<CircleCheck class="h-3 w-3 text-success" />
			</div>
		</Card.Content>
		
		<Card.Footer class="flex justify-between gap-2 pt-2">
			<Button class="w-full" onclick={handleCardClick}>
				<ExternalLink class="mr-2 h-4 w-4" />
				Open Project
			</Button>
			<Button variant="outline" size="icon" class="shrink-0" onclick={() => isEditDialogOpen = true}>
				<Edit class="h-4 w-4" />
				<span class="sr-only">Edit</span>
			</Button>
		</Card.Footer>
	</Card.Root>
{/if}

<AlertDialog.Root open={isDeleteDialogOpen} onOpenChange={(value) => isDeleteDialogOpen = value}>
	<AlertDialog.Content class="max-w-md" portalProps={{}}>
		<AlertDialog.Header class="space-y-2">
		  <AlertDialog.Title class="text-xl font-semibold">Delete Project</AlertDialog.Title>
		  <AlertDialog.Description class="text-muted-foreground">
			This action cannot be undone. This will permanently delete the project and all associated tasks.
		  </AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer class="flex justify-end gap-2">
		  <AlertDialog.Cancel class="mr-2">Cancel</AlertDialog.Cancel>
		  <AlertDialog.Action class="bg-destructive hover:bg-destructive/90" onclick={handleDelete}>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	  </AlertDialog.Content>
</AlertDialog.Root>

<EditProject 
  bind:project
  bind:open={isEditDialogOpen}
  on:projectUpdated={handleProjectUpdated}
/>