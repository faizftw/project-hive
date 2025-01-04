<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card';
	import type { Project } from '$lib/types';
	import { DotsHorizontal } from 'svelte-radix';
	import { ClockAlert, SquarePen, CircleCheck } from 'lucide-svelte';
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import { Button } from '$lib/components/ui/button';
	import * as AlertDialog from "$lib/components/ui/alert-dialog";
	import { projectsStore } from '$lib/stores/projects';
	import EditProject from './edit-project.svelte';
	import { Progress } from "$lib/components/ui/progress";
	import { tasksStore } from '$lib/stores/tasks';
	import { derived } from 'svelte/store';
	import { Badge } from "$lib/components/ui/badge";
	import { toast } from "svelte-sonner";

	export let project: Project;

	let isDeleteDialogOpen = false;
	let isEditDialogOpen = false;

	const setIsDeleteDialogOpen = (value: boolean) => {
		isDeleteDialogOpen = value;
	}

	const setIsEditDialogOpen = (value: boolean) => {
		isEditDialogOpen = value;
	}

	// Validasi data project
	$: {
		if (!project?.id || !project?.name) {
			console.error('Invalid project data:', project);
		}
	}

	// Menghitung progress
	const projectTasks = derived(tasksStore, $tasks => 
		$tasks.filter(task => task.projectId === project.id)
	);

	const completedTasks = derived(projectTasks, $projectTasks => 
		$projectTasks.filter(task => task.status === 'Completed').length
	);

	const totalTasks = derived(projectTasks, $projectTasks => $projectTasks.length);

	const progressPercentage = derived(
		[completedTasks, totalTasks],
		([$completedTasks, $totalTasks]) => {
			if ($totalTasks === 0) return 0;
			return Math.round(($completedTasks / $totalTasks) * 100);
		}
	);

	function formatDate(date: string | null) {
		if (!date) return 'Not set';
		
		try {
			const dateObj = new Date(date);
			
			if (isNaN(dateObj.getTime())) {
				console.error('Invalid date value:', date);
				return 'Not set';
			}

			return new Intl.DateTimeFormat('Us-En', {
				day: '2-digit',
				month: 'short',
				year: '2-digit',
				hour: '2-digit',
				minute: '2-digit'
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
				
				setIsDeleteDialogOpen(false);
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

	function getBadgeVariant(status: string) {
		switch (status) {
			case 'completed': return 'success';
			case 'active': return 'warning';
			case 'on-hold': return 'info';
			case 'cancelled': return 'error';
			default: return 'default';
		}
	}
</script>

{#if project && project.id}
	<Card.Root>
		<Card.Header>
			<div class="ms-auto">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class="focus:outline-none">
						<Button variant="ghost" >
							<DotsHorizontal class="h-4 w-4 ms-auto" />
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
					  <DropdownMenu.Group>
						<DropdownMenu.Item on:click={() => isEditDialogOpen = true}>
							Edit
						</DropdownMenu.Item>
						<DropdownMenu.Item on:click={() => setIsDeleteDialogOpen(true)}>
							Delete
						</DropdownMenu.Item>
					  </DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
			<Card.Title class="m-auto">{project.name || 'Untitled Project'}</Card.Title>
		</Card.Header>
		<Card.Content>
			<Card.Description>{project.description || 'No description'}</Card.Description>
		</Card.Content>
		<Card.Footer>
			<div>
				<div class="flex flex-row gap-2 my-1 items-center">
					<SquarePen class="h-4 w-4" color="#bbff00"/> 
					<p class="text-muted-foreground text-sm">{project.createdAt ? formatDate(project.createdAt) : '-'}</p>
				</div>
				<div class="flex flex-row gap-2 my-1">
					<ClockAlert class="h-4 w-4" color="#ff1900"/> 
					<p class="text-muted-foreground text-sm">{project.dueDate ? formatDate(project.dueDate) : '-'}</p>
				</div>
			</div>
		</Card.Footer>
		<Card.Footer>
			<div class="w-full">
				<p class="text-muted-foreground text-sm flex flex-row gap-1 items-center my-2">
					{ $completedTasks }/{ $totalTasks } <CircleCheck class="h-4 w-4" color="#44ff00" /> 
				</p>
				<Progress value={ $progressPercentage } />
				<Badge variant={getBadgeVariant(project.status || 'Unknown')} class="capitalize mt-3 ">{project.status || 'Unknown'}</Badge>
			</div>	
		</Card.Footer>
		<Card.Footer>
			<div class="m-auto">
				<Button on:click={handleCardClick}>Open Task</Button>
			</div>
		</Card.Footer>
	</Card.Root>
{/if}

<AlertDialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
		  <AlertDialog.Title>This project will be deleted </AlertDialog.Title>
		  <AlertDialog.Description>
			This action cannot be undone. This will permanently delete the project.
		  </AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
		  <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
		  <AlertDialog.Action on:click={handleDelete}>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	  </AlertDialog.Content>
</AlertDialog.Root>

<EditProject 
  bind:project
  bind:open={isEditDialogOpen}
  on:projectUpdated={handleProjectUpdated}
/>