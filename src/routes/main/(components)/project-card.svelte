<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Project } from '$lib/types';
	import DotsHorizontal from 'svelte-radix/DotsHorizontal.svelte';
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import { Button } from '$lib/components/ui/button';
	import * as AlertDialog from "$lib/components/ui/alert-dialog";
	import { projectsStore } from '$lib/stores/projects';
	import EditProject from './edit-project.svelte';


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

	function formatDate(date: string | null) {
		if (!date) return 'Not set';
		
		try {
			const dateObj = new Date(date);
			
			if (isNaN(dateObj.getTime())) {
				console.error('Invalid date value:', date);
				return 'Not set';
			}

			return new Intl.DateTimeFormat('id-ID', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
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
				setIsDeleteDialogOpen(false);
			} else {
				throw new Error(result.error || 'Gagal menghapus project');
			}
		} catch (err) {
			console.error('Error deleting project:', err);
			alert('Gagal menghapus project. Silakan coba lagi.');
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
</script>

{#if project && project.id}
	<Card.Root>
		<Card.Header>
			<div class="ms-auto">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
					<button>
						<DotsHorizontal class="h-4 w-4 ms-auto" />
					</button>
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
			<Card.Title>{project.name || 'Untitled Project'}</Card.Title>
		</Card.Header>
		<Card.Content>
			<Card.Description>{project.description || 'No description'}</Card.Description>
		</Card.Content>
		<Card.Footer>
			<div>
				<p class="text-muted-foreground text-sm">Status: {project.status || 'Unknown'}</p>
				<p class="text-muted-foreground text-sm">Created: {project.createdAt ? formatDate(project.createdAt) : 'Not set'}</p>
				<p class="text-muted-foreground text-sm">Due: {project.dueDate ? formatDate(project.dueDate) : 'Not set'}</p>
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