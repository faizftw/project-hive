<script lang="ts">
	import { CirclePlus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label as LabelComponent } from '$lib/components/ui/label';
	import { labels } from '../(data)/data';
	import { tasksStore } from '$lib/stores/tasks';
	import { toast } from 'svelte-sonner';
	import { createEventDispatcher } from 'svelte';
	import type { DateValue } from '@internationalized/date';
	import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import ClockIcon from 'lucide-svelte/icons/clock';
	import { refreshTableData } from '$lib/utils/table-utils';
	export let projectId: string;

	const dispatch = createEventDispatcher();

	let open = false;
	let isSubmitting = false;
	let title = '';
	let description = '';
	let priority = 'Low';
	let status = 'Pending';
	let label: string = 'general'; 
	let newLabel = '';
	let showNewLabelInput = false;

	// Tambahkan state untuk tanggal dan waktu
	let dateValue: DateValue | null = null;
	let timeValue = '';
	let formattedDateTime: string | null = null;
	let minDate = today(getLocalTimeZone());

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

	function handleTimeInput(event: Event) {
		const input = event.target as HTMLInputElement;
		timeValue = input.value;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		isSubmitting = true;

		let finalLabel = null;
		
		if (label === 'add-new' && newLabel.trim() !== '') {
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

		const newTask = {
			title,
			description,
			priority,
			status,
			deadline: formattedDateTime,
			projectId,
			label: finalLabel,
		};

		try {
			const response = await fetch('/api/tasks', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newTask)
			});

			const result = await response.json();

			if (response.ok) {
				tasksStore.addTask(result.task);
				await refreshTableData(projectId);
				dispatch('taskAdded', result.task);
				toast.success('Task berhasil ditambahkan!');
				resetForm();
			} else {
				const errorMessage = Array.isArray(result.error) 
					? result.error.map((e: any) => e.message).join(', ') 
					: result.error || 'Gagal menambahkan task.';
				throw new Error(errorMessage);
			}
		} catch (error: any) {
			toast.error(error.message);
			console.error('Error saat mengirim task:', error);
		} finally {
			isSubmitting = false;
		}
	}

	function resetForm() {
		title = '';
		description = '';
		priority = 'Low';
		status = 'Pending';
		dateValue = null;
		timeValue = '';
		label = 'general';
		newLabel = '';
		showNewLabelInput = false;
		open = false;
	}

	function capitalizeLabel(label: string) {
		return label.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button class='py-0 ml-auto me-2' size="sm">
			<CirclePlus class="mr-2 h-4 w-4" />
			Add Task
		</Button>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Add New Task</Dialog.Title>
			<Dialog.Description>Fill in the details of the task you want to add.</Dialog.Description>
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
					<LabelComponent for="description">Description</LabelComponent>
					<Input 
						id="description" 
						bind:value={description}
						placeholder="Description" 
						class="col-span-3" 
					/>
				</div>

				<!-- Priority dan Status fields tetap sama -->
				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="priority">Priority</LabelComponent>
					<select id="priority" bind:value={priority} class="mt-1 block w-full col-span-3">
						<option value="Low">Low</option>
						<option value="Medium">Medium</option>
						<option value="High">High</option>
					</select>
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="status">Status</LabelComponent>
					<select id="status" bind:value={status} class="mt-1 block w-full col-span-3">
						<option value="Backlog">Backlog</option>
						<option value="Pending">Pending</option>
						<option value="Todo">Todo</option>
						<option value="In Progress">In Progress</option>
						<option value="Completed">Completed</option>
						<option value="Canceled">Canceled</option>
					</select>
				</div>

				<!-- Label field tetap sama -->
				 
				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="label">Label</LabelComponent>
					<select id="label" bind:value={label} class="mt-1 block w-full col-span-3" on:change={() => showNewLabelInput = label === 'add-new'}>
						{#each labels as lbl}
							<option value={lbl.value}>{lbl.label}</option>
						{/each}
						<option value="add-new">Add New Label</option>
					</select>
				</div>
				{#if showNewLabelInput}
					<div class="grid grid-cols-4 items-center gap-4">
						<LabelComponent for="newLabel">New Label</LabelComponent>
						<Input class="col-span-3" id="newLabel" bind:value={newLabel} placeholder="Enter the new label" required />
					</div>
				{/if}
			

				<!-- Deadline field yang baru -->
				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="deadline">Deadline</LabelComponent>
					<div class="flex gap-2 col-span-3	">
						<Popover.Root>
							<Popover.Trigger asChild let:builder>
								<Button
									builders={[builder]}
									variant="outline"
									class={cn(
										'w-full justify-start text-left font-normal',
										!dateValue && 'text-muted-foreground'
									)}
								>
									<CalendarIcon class="mr-2 h-4 w-4" />
									{#if dateValue}
										{new DateFormatter('en-US', { dateStyle: 'long' }).format(
											dateValue.toDate(getLocalTimeZone())
										)}
									{:else}
										<span>Select date</span>
									{/if}
								</Button>
							</Popover.Trigger>
							<Popover.Content class="w-auto p-0">
								<Calendar mode="single" selected={dateValue} bind:value={dateValue} initialFocus minDate={minDate} />
							</Popover.Content>
						</Popover.Root>
						<Popover.Root>
							<Popover.Trigger asChild let:builder>
								<Button
									builders={[builder]}
									variant="outline"
									class={cn(
										'w-full justify-start text-left font-normal',
										!timeValue && 'text-muted-foreground'
									)}
								>
									<ClockIcon class="mr-2 h-4 w-4" />
									{#if timeValue}
										{timeValue}
									{:else}
										<span>Select time</span>
									{/if}
								</Button>
							</Popover.Trigger>
							<Popover.Content class="w-auto p-3">
								<Input type="time" value={timeValue} on:input={handleTimeInput} />
							</Popover.Content>
						</Popover.Root>
					</div>
				</div>

				{#if formattedDateTime}
					<div class="text-sm text-muted-foreground">
						Selected: {formattedDateTime}
					</div>
				{/if}

				<div class="flex justify-end space-x-2">
					<Button type="button" variant="outline" on:click={() => open = false}>Cancel</Button>
					<Button type="submit" disabled={isSubmitting}>
						{#if isSubmitting}
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