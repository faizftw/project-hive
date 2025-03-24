<script lang="ts">
	import DotsHorizontal from 'svelte-radix/DotsHorizontal.svelte';
	import { statuses } from '../(data)/data.js';
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
	
	// Normalisasi task dengan hati-hati
	let task: Task = $state(row);
	try {
		// Clone objek row untuk menghindari referensi
		let normalizedRow = JSON.parse(JSON.stringify(row));
		
		// Parse URL dengan hati-hati
		if (typeof normalizedRow.url === 'string' && normalizedRow.url) {
			try {
				normalizedRow.url = JSON.parse(normalizedRow.url);
			} catch (e) {
				console.error('Error parsing URL string:', e);
				normalizedRow.url = { url: normalizedRow.url, alias: null };
			}
		}
		
		// Pastikan properti yang diperlukan hadir
		normalizedRow.label = normalizedRow.label || null;
		normalizedRow.priority = normalizedRow.priority || 'Low';
		normalizedRow.status = normalizedRow.status || 'Pending';
		
		// Validate dengan schema
		task = taskSchema.parse(normalizedRow);
		
	} catch (error) {
		console.error('Error normalizing task:', error);
		// Fallback jika ada error
		task = row as Task;
	}
	
	let isDeleteDialogOpen = $state(false);
	let isEditDialogOpen = $state(false);
	let isSubmitting = $state(false);

	const setIsDeleteDialogOpen = (value: boolean) => {
		isDeleteDialogOpen = value;
	}

	const setIsEditDialogOpen = (value: boolean) => {
		isEditDialogOpen = value;
	}

	const deleteTask = async (id: string) => {
		if (isSubmitting) return;
		isSubmitting = true;
		
		try {
			// Tambahkan timestamp untuk mencegah cache
			const timestamp = new Date().getTime();
			
			const response = await fetch(`/api/tasks?_ts=${timestamp}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache'
				},
				body: JSON.stringify({ id })
			});
			
			const result = await response.json();
			
			if (response.ok) {
				console.log('Task deleted successfully, result:', result);
				
				// Refresh data berdasarkan projectId yang dikembalikan atau gunakan projectId saat ini
				const refreshProjectId = result.projectId || projectId;
				await refreshTableData(refreshProjectId);
				
				setIsDeleteDialogOpen(false);
				toast.success('Task deleted successfully');
			} else {
				throw new Error(result.error || 'Failed to delete task');
			}
		} catch (error: any) {
			console.error('Error deleting task:', error);
			toast.error(error.message);
		} finally {
			isSubmitting = false;
		}
	}

	const handleEditTask = async (event: CustomEvent<Task>) => {
		if (isSubmitting) return;
		isSubmitting = true;
		
		try {
			// Tambahkan timestamp untuk mencegah cache
			const timestamp = new Date().getTime();
			
			const updatedTask = event.detail;
			console.log('Sending update for task:', updatedTask);
			
			const response = await fetch(`/api/tasks/${task.id}?_ts=${timestamp}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache'
				},
				body: JSON.stringify(updatedTask)
			});

			if (response.ok) {
				// Refresh data dari server
				await refreshTableData(projectId);
				setIsEditDialogOpen(false);
				toast.success('Task updated successfully');
			} else {
				const data = await response.json();
				throw new Error(data.error || 'Failed to update task');
			}
		} catch (error: any) {
			console.error('Error updating task:', error);
			toast.error(error.message);
		} finally {
			isSubmitting = false;
		}
	}

	const handleSetStatus = async (status: string) => {
		if (isSubmitting) return;
		isSubmitting = true;
		
		try {
			// Tambahkan timestamp untuk mencegah cache
			const timestamp = new Date().getTime();
			
			// Mengambil nilai status yang diterima
			const statusValue = statuses.find(s => s.value === status)?.value || status;
			
			// Pastikan kita punya semua data task yang dibutuhkan
			const taskUpdate = {
				id: task.id,
				title: task.title,
				description: task.description,
				priority: task.priority,
				status: statusValue,
				deadline: task.deadline,
				projectId: task.projectId,
				label: task.label,
				url: task.url && typeof task.url === 'object' ? {
					url: task.url.url,
					alias: task.url.alias
				} : null
			};
			
			console.log('Updating task status:', taskUpdate);
			
			const response = await fetch(`/api/tasks/${task.id}?_ts=${timestamp}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache'
				},
				body: JSON.stringify(taskUpdate)
			});
			
			if (response.ok) {
				// Refresh data dari server 
				await refreshTableData(projectId);
				toast.success('Status berhasil diperbarui');
			} else {
				const data = await response.json();
				throw new Error(data.error || 'Gagal memperbarui status');
			}
		} catch (error: any) {
			console.error('Error setting status:', error);
			toast.error(error.message);
		} finally {
			isSubmitting = false;
		}
	} 
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button
				variant="ghost"
				class="data-[state=open]:bg-muted flex h-8 w-8 p-0"
				{...props}
				disabled={isSubmitting}
			>
				<DotsHorizontal class="h-4 w-4" />
				<span class="sr-only">Open Menu</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-[160px]" align="end" portalProps={{}}>
		<DropdownMenu.Item onclick={() => setIsEditDialogOpen(true)} class="cursor-default" inset={false}>Edit</DropdownMenu.Item>
		<DropdownMenu.Separator class="my-1" />
		<DropdownMenu.Sub>
			<DropdownMenu.SubTrigger class="cursor-default" inset={false}>Set Status</DropdownMenu.SubTrigger>
			<DropdownMenu.SubContent class="p-1" portalProps={{}}>
				<DropdownMenu.RadioGroup value={task.status || ''} onValueChange={handleSetStatus}>
					{#each statuses as status}
						<DropdownMenu.RadioItem value={status.value} class="cursor-default">
							{status.label}
						</DropdownMenu.RadioItem>
					{/each}
				</DropdownMenu.RadioGroup>
			</DropdownMenu.SubContent>
		</DropdownMenu.Sub>
		<DropdownMenu.Separator class="my-1" />
		<DropdownMenu.Item onclick={() => setIsDeleteDialogOpen(true)} class="cursor-default" inset={false}>
			Delete 
			<DropdownMenu.Shortcut class="ml-auto text-xs">⌘⌫</DropdownMenu.Shortcut>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<EditTask 
	bind:open={isEditDialogOpen} 
	task={task}
	on:taskUpdated={handleEditTask}
/>

<AlertDialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
	<AlertDialog.Content class="sm:max-w-[425px]" portalProps={{}}>
		<AlertDialog.Header class="space-y-2">
		  <AlertDialog.Title class="text-xl font-semibold">This task will be deleted</AlertDialog.Title>
		  <AlertDialog.Description class="text-sm text-muted-foreground">
			This action cannot be undone. This will permanently delete the task.
		  </AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer class="flex justify-end space-x-2">
		  <AlertDialog.Cancel class="mt-2">Cancel</AlertDialog.Cancel>
		  <AlertDialog.Action class="bg-red-500" onclick={() => deleteTask(task.id)}>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	  </AlertDialog.Content>
</AlertDialog.Root>
