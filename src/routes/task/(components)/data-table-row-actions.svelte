<script lang="ts">
	import DotsHorizontal from 'svelte-radix/DotsHorizontal.svelte';
	import { labels } from '../(data)/data.js';
	import { type Task, taskSchema } from '../(data)/schemas.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { tasksStore } from '$lib/stores/tasks';
	import { toast } from 'svelte-sonner';
	import { refreshTableData } from '$lib/utils/table-utils';
	import EditTask from './edit-task.svelte';
	import { projectsStore } from '$lib/stores/projects';

	interface Props {
		row: Task;
		projectId: string;
	}

	let { row, projectId }: Props = $props();
	const task = taskSchema.parse({
  	...row,
  	url: typeof row.url === 'string' ? { url: row.url, alias: null } : row.url
	});
	let isDeleteDialogOpen = $state(false);
	let isEditDialogOpen = $state(false);

	const setIsDeleteDialogOpen = (value: boolean) => {
		isDeleteDialogOpen = value;
	}

	const setIsEditDialogOpen = (value: boolean) => {
		isEditDialogOpen = value;
	}

	const deleteTask = async (id: string) => {
		try {
			const response = await fetch(`/api/tasks`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id })
			});
			
			if (response.ok) {
				// Hapus task dari store
				tasksStore.deleteTask(id);
				setTimeout(async () => {
					await refreshTableData(projectId);
				}, 500);
				setIsDeleteDialogOpen(false);
				toast.success('Task berhasil dihapus');
			} else {
				const data = await response.json();
				throw new Error(data.error || 'Gagal menghapus task');
			}
		} catch (error: any) {
			console.error('Error deleting task:', error);
			toast.error(error.message);
		}
	}

	const handleEditTask = async (event: CustomEvent<Task>) => {
		try {
			const updatedTask = event.detail;
			const response = await fetch(`/api/tasks/${task.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(updatedTask)
			});

			if (response.ok) {
				const result = await response.json();
				tasksStore.updateTask(result.task);
				setIsEditDialogOpen(false);
				toast.success('Task berhasil diperbarui');
			} else {
				const data = await response.json();
				throw new Error(data.error || 'Gagal memperbarui task');
			}
		} catch (error: any) {
			console.error('Error updating task:', error);
			toast.error(error.message);
		}
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger >
		{#snippet child({ props })}
			<Button
				variant="ghost"
				class="data-[state=open]:bg-muted flex h-8 w-8 p-0"
				{...props}
			>
				<DotsHorizontal class="h-4 w-4" />
				<span class="sr-only">Open Menu</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-[160px]" align="end">
		<DropdownMenu.Item onclick={() => setIsEditDialogOpen(true)}>Edit</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Sub>
			<DropdownMenu.SubTrigger>Labels</DropdownMenu.SubTrigger>
			<DropdownMenu.SubContent>
				<DropdownMenu.RadioGroup value={task.label}>
					{#each labels as label}
						<DropdownMenu.RadioItem value={label.value}>
							{label.label}
						</DropdownMenu.RadioItem>
					{/each}
				</DropdownMenu.RadioGroup>
			</DropdownMenu.SubContent>
		</DropdownMenu.Sub>
		<DropdownMenu.Separator />
		<DropdownMenu.Item onclick={() => setIsDeleteDialogOpen(true)}>
			Delete 
			<DropdownMenu.Shortcut>⌘⌫</DropdownMenu.Shortcut>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<EditTask 
	bind:open={isEditDialogOpen} 
	task={task}
	projectId={task.projectId}
	on:taskUpdated={handleEditTask}
/>

<AlertDialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
		  <AlertDialog.Title>This task will be deleted </AlertDialog.Title>
		  <AlertDialog.Description>
			This action cannot be undone. This will permanently delete the task.
		  </AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
		  <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
		  <AlertDialog.Action onclick={() => deleteTask(task.id)}>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	  </AlertDialog.Content>
</AlertDialog.Root>
