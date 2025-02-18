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
				throw new Error('Judul task tidak boleh kosong');
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
					newLabel: newLabel.trim()
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Gagal mengupdate task');
			}

			tasksStore.updateTask(result.task);
			await refreshTableData(task.projectId);
			dispatch('taskUpdated', result.task);
			open = false;
			toast.success('Task berhasil diperbarui');
		} catch (error: any) {
			console.error('Error updating task:', error);
			toast.error(error.message || 'Gagal mengupdate task');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Edit Task</Dialog.Title>
			<Dialog.Description>Fill in the details of the task you want to edit.</Dialog.Description>
		</Dialog.Header>
		
		<form on:submit={handleSubmit}>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="title" class="text-right">Title</LabelComponent>
					<Input 
						id="title" 
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
						bind:value={description}
						placeholder="Description" 
						class="col-span-3" 
					/>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="priority" class="text-right">Priority</LabelComponent>
					<select id="priority" bind:value={priority} class="col-span-3 p-2 border rounded">
						<option value="Low">Low</option>
						<option value="Medium">Medium</option>
						<option value="High">High</option>
					</select>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="status" class="text-right">Status</LabelComponent>
					<select id="status" bind:value={status} class="col-span-3 p-2 border rounded">
						<option value="Backlog">Backlog</option>
						<option value="Pending">Pending</option>
						<option value="Todo">Todo</option>
						<option value="In Progress">In Progress</option>
						<option value="Completed">Completed</option>
						<option value="Canceled">Canceled</option>
					</select>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="label" class="text-right">Label</LabelComponent>
					<select 
						id="label" 
						bind:value={label} 
						class="col-span-3 p-2 border rounded"
						on:change={() => showNewLabelInput = label === 'add-new'}
					>
						{#each labels as lbl}
							<option value={lbl.value}>{lbl.label}</option>
						{/each}
						<option value="add-new">Add New Label</option>
					</select>
				</div>

				{#if showNewLabelInput}
					<div class="grid grid-cols-4 items-center gap-4">
						<LabelComponent for="newLabel" class="text-right">New Label</LabelComponent>
						<Input 
							id="newLabel" 
							bind:value={newLabel} 
							placeholder="Enter new label" 
							class="col-span-3" 
							required={label === 'add-new'}
						/>
					</div>
				{/if}

				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="deadline" class="text-right">Deadline</LabelComponent>
					<div class="flex gap-2 col-span-3">
						<Popover.Root>
							<Popover.Trigger >
								<Button
									variant="outline"
									class={cn(
										'w-[240px] justify-start text-left font-normal',
										!dateValue && 'text-muted-foreground'
									)}
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
							</Popover.Trigger>
							<Popover.Content class="w-auto p-0">
								<Calendar 
									mode="single" 
									bind:value={dateValue} 
									selected={dateValue} 
									minDate={minDate} 
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
			</div>

			<Dialog.Footer>
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