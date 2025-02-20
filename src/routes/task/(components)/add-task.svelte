<script lang="ts">
	import { CirclePlus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label as LabelComponent } from '$lib/components/ui/label/index.js';
	import { labels } from '../(data)/data';
	import { tasksStore } from '$lib/stores/tasks';
	import { toast } from 'svelte-sonner';
	import { createEventDispatcher } from 'svelte';
	import type { DateValue } from '@internationalized/date';
	import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils.js';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import ClockIcon from 'lucide-svelte/icons/clock';
	import { refreshTableData } from '$lib/utils/table-utils';
	let { projectId }: { projectId: string } = $props();
	import { projectsStore } from '$lib/stores/projects';

	const dispatch = createEventDispatcher();

	let state = $state({
		open: false,
		isSubmitting: false,
		title: '',
		description: '',
		priority: 'Low',
		status: 'Pending',
		label: 'general',
		newLabel: '',
		showNewLabelInput: false,
		dateValue: null as DateValue | null,
		timeValue: '',
		formattedDateTime: null as string | null,
		url: '',
		urlAlias: ''
	});

	const minDate = today(getLocalTimeZone());

	$effect(() => {
		if (state.dateValue && state.timeValue) {
			try {
				const date = state.dateValue.toDate(getLocalTimeZone());
				const [hours, minutes] = state.timeValue.split(':');
				date.setHours(parseInt(hours));
				date.setMinutes(parseInt(minutes));
				state.formattedDateTime = date.toISOString();
			} catch (err) {
				console.error('Error formatting date time:', err);
				state.formattedDateTime = null;
			}
		} else {
			state.formattedDateTime = null;
		}
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		state.isSubmitting = true;

		let finalLabel = null;
		
		if (state.label === 'add-new' && state.newLabel.trim() !== '') {
			finalLabel = {
				value: state.newLabel.trim().toLowerCase().replace(/\s+/g, '-'),
				label: state.newLabel.trim()
			};
		} else if (state.label !== 'add-new') {
			const selectedLabel = labels.find(l => l.value === state.label);
			if (selectedLabel) finalLabel = { ...selectedLabel };
		}

		if (state.formattedDateTime && new Date(state.formattedDateTime) < new Date()) {
			toast.error('Deadline must be in the future');
			state.isSubmitting = false;
			return;
		}

		const project = $projectsStore.find(p => p.id === projectId);
		if (project?.dueDate && state.formattedDateTime) {
			const taskDeadline = new Date(state.formattedDateTime);
			const projectDeadline = new Date(project.dueDate);

			if (taskDeadline > projectDeadline) {
				toast.error('Task deadline cannot exceed project deadline');
				state.isSubmitting = false;
				return;
			}
		}

		const newTask = {
			title: state.title,
			description: state.description,
			priority: state.priority,
			status: state.status,
			deadline: state.formattedDateTime,
			projectId,
			label: finalLabel,
			url: state.url ? {
				url: state.url,
				alias: state.urlAlias || null
			} : null,
		};

		try {
			const response = await fetch('/api/tasks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newTask)
			});

			const result = await response.json();

			if (response.ok) {
				tasksStore.addTask(result.task);
				await refreshTableData(projectId);
				dispatch('taskAdded', result.task);
				toast.success('Task added successfully');
				resetForm();
			} else {
				const errorMessage = Array.isArray(result.error) 
					? result.error.map((e: any) => e.message).join(', ') 
					: result.error || 'Failed to add task.';
				throw new Error(errorMessage);
			}
		} catch (error: any) {
			toast.error(error.message);
			console.error('Error submitting task:', error);
		} finally {
			state.isSubmitting = false;
		}
	}

	function resetForm() {
		state.title = '';
		state.description = '';
		state.priority = 'Low';
		state.status = 'Pending';
		state.dateValue = null;
		state.timeValue = '';
		state.label = 'general';
		state.newLabel = '';
		state.showNewLabelInput = false;
		state.open = false;
		state.url = '';
		state.urlAlias = '';
	}

	function capitalizeLabel(label: string) {
		return label.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
	}
</script>

<Dialog.Root bind:open={state.open} on:openChange={(e) => state.open = e.detail}>
	<Dialog.Trigger>
		<Button class="py-0 ml-auto me-2" size="sm">
			<CirclePlus class="mr-2 h-4 w-4" />
			Add Task
		</Button>
	</Dialog.Trigger>
	
	<Dialog.Content class="inline-block">
		<Dialog.Header>
			<Dialog.Title>Add New Task</Dialog.Title>
			<Dialog.Description>Fill in the details of the task you want to add.</Dialog.Description>
		</Dialog.Header>
		
		<form onsubmit={handleSubmit}>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="title" class="text-right">Title</LabelComponent>
					<Input 
						id="title" 
						bind:value={state.title}
						placeholder="Task Name" 
						class="col-span-3" 
						required 
					/>
				</div>
				
				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="description">Description</LabelComponent>
					<Input 
						id="description" 
						bind:value={state.description}
						placeholder="Description" 
						class="col-span-3" 
					/>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="priority">Priority</LabelComponent>
					<select 
						id="priority" 
						bind:value={state.priority} 
						class="mt-1 block w-full col-span-3"
					>
						<option value="Low">Low</option>
						<option value="Medium">Medium</option>
						<option value="High">High</option>
					</select>
				</div>
				
				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="status">Status</LabelComponent>
					<select 
						id="status" 
						bind:value={state.status} 
						class="mt-1 block w-full col-span-3"
					>
						<option value="Backlog">Backlog</option>
						<option value="Pending">Pending</option>
						<option value="Todo">Todo</option>
						<option value="In Progress">In Progress</option>
						<option value="Completed">Completed</option>
						<option value="Canceled">Canceled</option>
					</select>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="label">Label</LabelComponent>
					<select 
						id="label" 
						bind:value={state.label} 
						class="mt-1 block w-full col-span-3" 
						onchange={() => state.showNewLabelInput = state.label === 'add-new'}
					>
						{#each labels as lbl}
							<option value={lbl.value}>{lbl.label}</option>
						{/each}
						<option value="add-new">Add New Label</option>
					</select>
				</div>
				
				{#if state.showNewLabelInput}
					<div class="grid grid-cols-4 items-center gap-4">
						<LabelComponent for="newLabel">New Label</LabelComponent>
						<Input 
							class="col-span-3" 
							id="newLabel" 
							bind:value={state.newLabel} 
							placeholder="Enter the new label" 
							required 
						/>
					</div>
				{/if}

				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="deadline">Deadline</LabelComponent>
					<div class="flex gap-2 col-span-3">
						<Popover.Root>
							<Popover.Trigger>
								<Button
									variant="outline"
									class={cn(
										'w-full justify-start text-left font-normal',
										!state.dateValue && 'text-muted-foreground'
									)}
								>
									<CalendarIcon class="mr-2 h-4 w-4" />
									{#if state.dateValue}
										{new DateFormatter('en-US', { dateStyle: 'long' }).format(
											state.dateValue.toDate(getLocalTimeZone())
										)}
									{:else}
										<span>Select date</span>
									{/if}
								</Button>
							</Popover.Trigger>
							<Popover.Content class="w-auto p-0">
								<Calendar 
									mode="single" 
									selected={state.dateValue} 
									bind:value={state.dateValue} 
									initialFocus 
									minDate={minDate} 
								/>
							</Popover.Content>
						</Popover.Root>
						
						<Popover.Root>
							<Popover.Trigger >
								<Button
									variant="outline"
									class={cn(
										'w-full justify-start text-left font-normal',
										!state.timeValue && 'text-muted-foreground'
									)}
								>
									<ClockIcon class="mr-2 h-4 w-4" />
									{#if state.timeValue}
										{state.timeValue}
									{:else}
										<span>Select time</span>
									{/if}
								</Button>
							</Popover.Trigger>
							<Popover.Content class="w-auto p-3">
								<Input 
									type="time" 
									value={state.timeValue} 
									oninput={(e: Event) => state.timeValue = (e.target as HTMLInputElement).value} 
								/>
							</Popover.Content>
						</Popover.Root>
					</div>
				</div>

				{#if state.formattedDateTime}
					<div class="text-sm text-muted-foreground">
						Selected: {state.formattedDateTime}
					</div>
				{/if}

				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="url">URL</LabelComponent>
					<Input 
						id="url" 
						type="url"
						bind:value={state.url}
						placeholder="https://example.com" 
						class="col-span-3"
					/>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="urlAlias">URL Alias</LabelComponent>
					<Input 
						id="urlAlias" 
						bind:value={state.urlAlias}
						placeholder="Name of the URL" 
						class="col-span-3"
					/>
				</div>

				<div class="flex justify-end space-x-2">
					<Button type="button" variant="outline" onclick={() => state.open = false} class=''>
						Cancel
					</Button>
					<Button type="submit" disabled={state.isSubmitting} class=''>
						{#if state.isSubmitting}
							Loading...
						{:else}
							Save
						{/if}
					</Button>
				</div>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>