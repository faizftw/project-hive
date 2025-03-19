<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label as LabelComponent } from '$lib/components/ui/label/index.js';
	import { labels } from '../(data)/data';
	import { tasksStore } from '$lib/stores/tasks';
	import { createEventDispatcher } from 'svelte';
	import type { DateValue } from '@internationalized/date';
	import { DateFormatter, getLocalTimeZone, today, parseDate } from '@internationalized/date';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils.js';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import type { Task } from '../(data)/schemas';
	import { toast } from 'svelte-sonner';
	import { projectsStore } from '$lib/stores/projects';
	import * as Select from "$lib/components/ui/select/index.js";
	export let open = false;
	export let task: Task | null = null;
	import { refreshTableData } from '$lib/utils/table-utils';
	const dispatch = createEventDispatcher<{
		taskUpdated: Task;
	}>();

	let isSubmitting = false;
	let title = '';
	let description = '';
	let priority = 'Low';
	let status = 'Pending';
	let label: string = 'general'; 
	let newLabel = '';
	let showNewLabelInput = false;
	let dateValue: DateValue | null = null;
	let timeValue = '';
	let formattedDateTime: string | null = null;
	let minDate = today(getLocalTimeZone());
	let url = '';
	let urlAlias = '';

	function resetForm() {
		if (task) {
			title = task.title;
			description = task.description || '';
			priority = task.priority;
			status = task.status;
			
			if (task.label) {
				if (typeof task.label === 'string') {
					label = task.label;
				} else {
					label = task.label.value;
				}
			} else {
				label = 'general';
			}
			
			if (task.deadline) {
				try {
					const date = new Date(task.deadline);
					const dateStr = date.toISOString().split('T')[0];
					dateValue = parseDate(dateStr);
					timeValue = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
				} catch (err) {
					console.error('Error parsing date:', err);
					dateValue = null;
					timeValue = '';
				}
			} else {
				dateValue = null;
				timeValue = '';
			}

			// Proses URL dengan benar
			if (task.url) {
				// Jika URL adalah string JSON, parse terlebih dahulu
				let urlObj = task.url;
				if (typeof task.url === 'string') {
					try {
						urlObj = JSON.parse(task.url);
					} catch (e) {
						console.error('Error parsing URL:', e);
						urlObj = { url: task.url, alias: null };
					}
				}
				
				url = urlObj.url || '';
				urlAlias = urlObj.alias || '';
			} else {
				url = '';
				urlAlias = '';
			}
		}
	}

	// Reset form saat dialog dibuka
	$: if (open && task) {
		resetForm();
	}

	// Reactive statement untuk format tanggal
	$: if (dateValue && timeValue) {
		try {
			const date = dateValue.toDate(getLocalTimeZone());
			const [hours, minutes] = timeValue.split(':');
			date.setHours(parseInt(hours));
			date.setMinutes(parseInt(minutes));
			formattedDateTime = date.toISOString();
		} catch (err) {
			console.error('Error formatting date time:', err);
			formattedDateTime = null;
		}
	} else {
		formattedDateTime = null;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		if (!task) return;
		
		isSubmitting = true;

		try {
			// Validasi input
			if (!title.trim()) {
				throw new Error('Title is required');
			}
			
			// Validasi deadline
			if (!dateValue || !timeValue) {
				throw new Error('Deadline task (date and time) is required');
			}

			// Validasi deadline project
			if (formattedDateTime && task.projectId) {
				const project = $projectsStore.find(p => p.id === task.projectId);
				if (project?.dueDate && formattedDateTime) {
					const taskDeadline = new Date(formattedDateTime);
					const projectDeadline = new Date(project.dueDate);

					if (taskDeadline > projectDeadline) {
						toast.error('Task deadline cannot exceed project deadline');
						isSubmitting = false;
						return;
					}
				}
			}

			let finalLabel = null;
			if (label === 'add-new' && newLabel.trim()) {
				finalLabel = {
					value: newLabel.trim().toLowerCase().replace(/\s+/g, '-'),
					label: newLabel.trim()
				};
			} else if (label !== 'add-new') {
				const selectedLabel = labels.find(l => l.value === label);
				if (selectedLabel) {
					finalLabel = { ...selectedLabel };
				}
			}

			const response = await fetch(`/api/tasks/${task.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title,
					description,
					priority,
					status,
					deadline: formattedDateTime,
					label: finalLabel,
					newLabel: newLabel.trim(),
					url: url ? {
						url: url,
						alias: urlAlias || null
					} : null
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to update task');
			}

			tasksStore.updateTask(result.task);
			await refreshTableData(task.projectId);
			dispatch('taskUpdated', result.task);
			open = false;
			toast.success('Task updated');
		} catch (error: any) {
			console.error('Error updating task:', error);
			toast.error(error.message || 'Failed to update task');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="inline-block" portalProps={{}}>
		<Dialog.Header class="space-y-2">
			<Dialog.Title class="text-xl font-semibold">Edit Task</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">Fill in the details of the task you want to edit.</Dialog.Description>
		</Dialog.Header>
		
		<form onsubmit={handleSubmit}>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="title" class="text-right">
						Title
					</LabelComponent>
					<Input 
						id="title" 
						type="text"
						bind:value={title}
						placeholder="Task Name" 
						class="col-span-3" 
						required 
					/>
				</div>
				
				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="description" class="text-right">Description</LabelComponent>
					<Input 
						id="description" 
						type="text"
						bind:value={description}
						placeholder="Description" 
						class="col-span-3" 
					/>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="priority" class="text-right">Priority</LabelComponent>
					<Select.Root type="single" bind:value={priority}>
						<Select.Trigger class="mt-1 w-full col-span-3">
							{priority}
						</Select.Trigger>
						<Select.Content class="overflow-y-auto max-h-60" portalProps={{}}>
							<Select.Item class="cursor-pointer" value="Low" label="Low">Low</Select.Item>
							<Select.Item class="cursor-pointer" value="Medium" label="Medium">Medium</Select.Item>
							<Select.Item class="cursor-pointer" value="High" label="High">High</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="status" class="text-right">Status</LabelComponent>
					<Select.Root type="single" bind:value={status}>
						<Select.Trigger class="mt-1 w-full col-span-3">
							{status}
						</Select.Trigger>
						<Select.Content class="overflow-y-auto max-h-60" portalProps={{}}>
							<Select.Item class="cursor-pointer" value="Backlog" label="Backlog">Backlog</Select.Item>
							<Select.Item class="cursor-pointer" value="Pending" label="Pending">Pending</Select.Item>
							<Select.Item class="cursor-pointer" value="Todo" label="Todo">Todo</Select.Item>
							<Select.Item class="cursor-pointer" value="In Progress" label="In Progress">In Progress</Select.Item>
							<Select.Item class="cursor-pointer" value="Completed" label="Completed">Completed</Select.Item>
							<Select.Item class="cursor-pointer" value="Canceled" label="Canceled">Canceled</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="label" class="text-right">Label</LabelComponent>
					<Select.Root type="single" bind:value={label} onValueChange={(value) => showNewLabelInput = value === 'add-new'}>
						<Select.Trigger class="mt-1 w-full col-span-3">
							{label}
						</Select.Trigger>
						<Select.Content class="overflow-y-auto max-h-60" portalProps={{}}>
							{#each labels as lbl}
								<Select.Item class="cursor-pointer" value={lbl.value} label={lbl.label}>{lbl.label}</Select.Item>
							{/each}
							<Select.Item class="cursor-pointer" value="add-new" label="Add New Label">Add New Label</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				{#if showNewLabelInput}
					<div class="grid grid-cols-4 items-center gap-4">
						<LabelComponent for="newLabel" class="text-right">New Label</LabelComponent>
						<Input 
							id="newLabel" 
							type="text"
							bind:value={newLabel} 
							placeholder="Enter new label" 
							class="col-span-3" 
							required={label === 'add-new'}
						/>
					</div>
				{/if}

				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="deadline" class="text-right">
						Deadline
					</LabelComponent>
					<div class="flex gap-2 col-span-3">
						<Popover.Root>
							<Popover.Trigger >
								{#snippet child({ props })}
								<Button
									variant="outline"
									class={cn(
										'w-[240px] justify-start text-left font-normal',
										!dateValue && 'text-muted-foreground'
									)}
									{...props}
								>
									<CalendarIcon class="mr-2 h-4 w-4" />
									{#if dateValue}
										{new DateFormatter('id-ID', { dateStyle: 'long' }).format(
											dateValue.toDate(getLocalTimeZone())
										)}
									{:else}
										<span>Pick a date</span>
									{/if}
								</Button>
								{/snippet}
							</Popover.Trigger>
							<Popover.Content class="w-auto p-0" portalProps={{}}>
								<Calendar 
									mode="single" 
									bind:value={dateValue} 
									selected={dateValue} 
									minDate={minDate}
									class="border rounded-md" 
								/>
							</Popover.Content>
						</Popover.Root>

						<Input
							type="time"
							class="w-[120px]"
							bind:value={timeValue}
						/>
					</div>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="url" class="text-right">URL</LabelComponent>
					<Input 
						id="url" 
						type="url"
						bind:value={url}
						placeholder="https://example.com" 
						class="col-span-3"
					/>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="urlAlias" class="text-right">URL Alias</LabelComponent>
					<Input 
						id="urlAlias" 
						type="text"
						bind:value={urlAlias}
						placeholder="Nama tampilan untuk URL" 
						class="col-span-3"
					/>
				</div>
			</div>

			<Dialog.Footer class="flex justify-end space-x-2">
				<Button type="button" variant="outline" onclick={() => (open = false)} class="">
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting} class="">
					{isSubmitting ? 'Saving...' : 'Save'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>