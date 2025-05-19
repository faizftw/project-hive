<script lang="ts">
	import { CirclePlus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label as LabelComponent } from '$lib/components/ui/label/index.js';
	import { labels } from '../(data)/data';
	import { tasksStore } from '$lib/stores/tasks';
	import { toast } from 'svelte-sonner';
import { CrossCircled } from 'svelte-radix';
import * as Alert from '$lib/components/ui/alert/index.js';
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
	import * as Select from "$lib/components/ui/select/index.js";
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
		urlAlias: '',
		errorMessage: '',
		showAlert: false
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

	$effect(() => {
		// Update showNewLabelInput saat label berubah
		state.showNewLabelInput = state.label === 'add-new';
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		state.isSubmitting = true;

		// Validasi judul task
		if (!state.title.trim()) {
			state.errorMessage = 'Judul tugas harus diisi';
			state.showAlert = true;
			state.isSubmitting = false;
			return;
		}

		// Validasi deadline
		if (!state.dateValue || !state.timeValue) {
			state.errorMessage = 'Deadline tugas (tanggal dan waktu) harus diisi';
			state.showAlert = true;
			state.isSubmitting = false;
			return;
		}

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
			state.errorMessage = 'Deadline tugas harus di masa depan';
			state.showAlert = true;
			state.isSubmitting = false;
			return;
		}

		const project = $projectsStore.find(p => p.id === projectId);
		if (project?.dueDate && state.formattedDateTime) {
			const taskDeadline = new Date(state.formattedDateTime);
			const projectDeadline = new Date(project.dueDate);

			if (taskDeadline > projectDeadline) {
				state.errorMessage = 'Deadline tugas tidak boleh melebihi deadline proyek';
				state.showAlert = true;
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
			// Tambahkan timestamp untuk mencegah cache
			const timestamp = new Date().getTime();
			
			const response = await fetch(`/api/tasks?_ts=${timestamp}`, {
				method: 'POST',
				headers: { 
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache'
				},
				body: JSON.stringify(newTask)
			});

			const result = await response.json();

			if (response.ok) {
				// Pastikan data direfresh dari server dengan timestamp baru
				await refreshTableData(projectId);
				
				dispatch('taskAdded', result.task);
				toast.success('Tugas berhasil ditambahkan');
				resetForm();
			} else {
				const errorMessage = Array.isArray(result.error) 
					? result.error.map((e: any) => e.message).join(', ') 
					: result.error || 'Gagal menambahkan tugas';
				throw new Error(errorMessage);
			}
		} catch (error: any) {
			state.errorMessage = error.message;
			state.showAlert = true;
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
		state.showAlert = false;
		state.errorMessage = '';
	}

	function capitalizeLabel(label: string) {
		return label.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
	}

	const handleOpenChange = (e: CustomEvent<boolean>) => {
		state.open = e.detail;
	};
</script>

<Dialog.Root bind:open={state.open} on:openChange={handleOpenChange}>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button class="py-0 ml-auto me-2" size="sm" {...props}>
				<CirclePlus class="mr-2 h-4 w-4" />
				Buat Tugas
			</Button>
		{/snippet}
	</Dialog.Trigger>
	
	<Dialog.Content class="inline-block" portalProps={{}}>
		{#if state.showAlert}
			<Alert.Root variant="destructive">
				<CrossCircled class="h-4 w-4" />
				<Alert.Title>Error</Alert.Title>
				<Alert.Description>{state.errorMessage}</Alert.Description>
			</Alert.Root>
		{/if}
		<Dialog.Header class="space-y-2">
			<Dialog.Title class="text-xl font-semibold">Buat Tugas Baru</Dialog.Title>
			<Dialog.Description class="text-sm text-muted-foreground">Isi detail tugas yang ingin Anda tambahkan.</Dialog.Description>
		</Dialog.Header>
		
		<form onsubmit={handleSubmit}>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="title" class="text-right">
						Judul
					</LabelComponent>
					<Input 
						id="title" 
						type="text"
						bind:value={state.title}
						placeholder="Judul Tugas" 
						class="col-span-3" 
						required 
					/>
				</div>
				
				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="description" class="text-right">Deskripsi</LabelComponent>
					<Input 
						id="description" 
						type="text"
						bind:value={state.description}
						placeholder="Deskripsi" 
						class="col-span-3" 
					/>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="priority" class="text-right">Prioritas</LabelComponent>
					<Select.Root type="single" bind:value={state.priority}>
						<Select.Trigger class="mt-1 w-full col-span-3">
							{state.priority}
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
					<Select.Root type="single" bind:value={state.status}>
						<Select.Trigger class="mt-1 w-full col-span-3">
							{state.status}
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
					<Select.Root type="single" bind:value={state.label}>
						<Select.Trigger class="mt-1 w-full col-span-3">
							{state.label}
						</Select.Trigger>
						<Select.Content class="overflow-y-auto max-h-60" portalProps={{}}>
							{#each labels as lbl}
								<Select.Item class="cursor-pointer" value={lbl.value} label={lbl.label}>{lbl.label}</Select.Item>
							{/each}
							<Select.Item class="cursor-pointer" value="add-new" label="Add New Label">Add New Label</Select.Item>
						</Select.Content>
						</Select.Root>
				</div>
				
				{#if state.showNewLabelInput}
					<div class="grid grid-cols-4 items-center gap-4">
						<LabelComponent for="newLabel" class="text-right">Label Baru</LabelComponent>
						<Input 
							type="text"
							class="col-span-3" 
							id="newLabel" 
							bind:value={state.newLabel} 
							placeholder="Enter new label" 
							required 
						/>
					</div>
				{/if}

				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="deadline" class="text-right">
						Deadline
					</LabelComponent>
					<div class="flex gap-2 col-span-3">
						<Popover.Root>
							<Popover.Trigger>
								{#snippet child({ props })}
								<Button
									variant="outline"
									class={cn(
										'w-full justify-start text-left font-normal',
										!state.dateValue && 'text-muted-foreground'
									)}
									{...props}
								>
									<CalendarIcon class="mr-2 h-4 w-4" />
									{#if state.dateValue}
										{new DateFormatter('en-US', { dateStyle: 'long' }).format(
											state.dateValue.toDate(getLocalTimeZone())
										)}
									{:else}
										<span>Pilih tanggal</span>
									{/if}
								</Button>
								{/snippet}
							</Popover.Trigger>
							<Popover.Content class="w-auto p-0" portalProps={{}}>
								<Calendar 
									mode="single" 
									selected={state.dateValue} 
									bind:value={state.dateValue} 
									initialFocus 
									minDate={minDate}
									class="border rounded-md"
								/>
							</Popover.Content>
						</Popover.Root>
						
						<Popover.Root>
							<Popover.Trigger >
								{#snippet child({ props })}
								<Button
									variant="outline"
									class={cn(
										'w-full justify-start text-left font-normal',
										!state.timeValue && 'text-muted-foreground'
									)}
									{...props}
								>
									<ClockIcon class="mr-2 h-4 w-4" />
									{#if state.timeValue}
										{state.timeValue}
									{:else}
										<span>Pilih waktu</span>
									{/if}
								</Button>
								{/snippet}
							</Popover.Trigger>
							<Popover.Content class="w-auto p-3" portalProps={{}}>
								<Input 
									type="time" 
									value={state.timeValue} 
									oninput={(e: Event) => state.timeValue = (e.target as HTMLInputElement).value}
									class="w-full"
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
					<LabelComponent for="url" class="text-right">URL</LabelComponent>
					<Input 
						id="url" 
						type="url"
						bind:value={state.url}
						placeholder="https://example.com" 
						class="col-span-3"
					/>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<LabelComponent for="urlAlias" class="text-right">URL Alias</LabelComponent>
					<Input 
						id="urlAlias" 
						type="text"
						bind:value={state.urlAlias}
						placeholder="Nama tampilan untuk URL" 
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