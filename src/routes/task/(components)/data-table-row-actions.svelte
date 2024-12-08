<script lang="ts">
	import DotsHorizontal from 'svelte-radix/DotsHorizontal.svelte';
	import { labels } from '../(data)/data.js';
	import { type Task, taskSchema } from '../(data)/schemas.js';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { tasksStore } from '$lib/stores/tasks';
	import { toast } from 'svelte-sonner';
	import EditTask from './edit-task.svelte';

	export let row: Task;
	const task = taskSchema.parse(row);
	let isDeleteDialogOpen = false;
	let isEditDialogOpen = false;

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
	<DropdownMenu.Trigger asChild let:builder>
		<Button
			variant="ghost"
			builders={[builder]}
			class="data-[state=open]:bg-muted flex h-8 w-8 p-0"
		>
			<DotsHorizontal class="h-4 w-4" />
			<span class="sr-only">Open Menu</span>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-[160px]" align="end">
		<DropdownMenu.Item on:click={() => setIsEditDialogOpen(true)}>Edit</DropdownMenu.Item>
		<DropdownMenu.Item>Make a copy</DropdownMenu.Item>
		<DropdownMenu.Item>Favorite</DropdownMenu.Item>
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
		<DropdownMenu.Item on:click={() => setIsDeleteDialogOpen(true)}>
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
		  <AlertDialog.Action on:click={() => deleteTask(task.id)}>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	  </AlertDialog.Content>
</AlertDialog.Root>
