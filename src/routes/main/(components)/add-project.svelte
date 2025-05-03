<script lang="ts">
	import Add from 'lucide-svelte/icons/circle-plus';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import ClockIcon from 'lucide-svelte/icons/clock';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { Project } from '$lib/types';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogTrigger,
		DialogFooter
	} from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input//index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { createEventDispatcher } from 'svelte';
	import type { DateValue } from '@internationalized/date';
	import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { projectsStore } from '$lib/stores/projects';
	import { toast } from 'svelte-sonner';

	const dispatch = createEventDispatcher<{
		projectAdded: { data: Project };
	}>();

	let open = false;
	let isSubmitting = false;
	let dateValue: DateValue | null = null;
	let timeValue = '';
	let formattedDateTime: string | null = null;

	// Tetapkan tanggal minimum sebagai hari ini
	let minDate = today(getLocalTimeZone());

	$: if (dateValue && timeValue) {
		try {
			const date = dateValue.toDate(getLocalTimeZone());
			const [hours, minutes] = timeValue.split(':');
			
			// Set jam dan menit ke date object
			date.setHours(parseInt(hours));
			date.setMinutes(parseInt(minutes));
			
			// Format ke ISO string
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

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		isSubmitting = true;

		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		
		// Validasi nama project
		const projectName = formData.get('name') as string;
		if (!projectName || !projectName.trim()) {
			toast.error('Nama proyek harus diisi');
			isSubmitting = false;
			return;
		}

		// Gabungkan dateValue dan timeValue menjadi objek Date
		let selectedDateTime: Date | null = null;
		if (dateValue && timeValue) {
			try {
				const date = dateValue.toDate(getLocalTimeZone());
				const [hours, minutes] = timeValue.split(':');
				date.setHours(parseInt(hours));
				date.setMinutes(parseInt(minutes));
				selectedDateTime = date;
			} catch (err) {
				console.error('Error formatting date time:', err);
				selectedDateTime = null;
			}
		} else {
			toast.error('Tanggal dan waktu deadline proyek wajib diisi');
			isSubmitting = false;
			return;
		}

		// Validasi apakah deadline tidak di masa lalu
		if (selectedDateTime && selectedDateTime < new Date()) {
			toast.error('Deadline tidak boleh di masa lalu');
			isSubmitting = false;
			return;
		}

		if (formattedDateTime) {
			formData.append('dueDate', formattedDateTime);
		}

		fetch('?/createProject', {
			method: 'POST',
			body: formData
		})
		.then(async (response) => {
			const result = await response.json();
			console.log('Raw server response:', result);

			if (result.type === 'success') {
				// Parse data string menjadi array
				const parsedData = JSON.parse(result.data);
				console.log('Parsed data:', parsedData);

				// Extract project data dengan index yang benar
				const newProject: Project = {
					id: parsedData[4],
					name: parsedData[5],
					description: parsedData[6],
					status: parsedData[7],
					dueDate: parsedData[8],
					createdAt: parsedData[9],
					createdById: parsedData[10],
					createdBy: {
						id: parsedData[10],
						name: parsedData[12],
						email: parsedData[13]
					}
				};

				console.log('Formatted project:', newProject);

				if (!newProject.id || !newProject.name) {
					throw new Error('Invalid project data received');
				}

				projectsStore.addProject(newProject);
				dispatch('projectAdded', { data: newProject });
				
				form.reset();
				dateValue = null;
				timeValue = '';
				open = false;
				toast.success('Proyek berhasil dibuat');
			} else {
				throw new Error(result.error || 'Gagal membuat proyek');
			}
		})
		.catch((err) => {
			console.error('Error creating project:', err);
			toast.error(`Gagal membuat proyek: ${err.message}`);
		})
		.finally(() => {
			isSubmitting = false;
		});
	}
</script>

<Dialog bind:open>
	<DialogTrigger>
		{#snippet child({ props })}
		<Button 
			class="flex items-center"
			aria-label="Buat Proyek"
			{...props}
		>
			<Add class="h-4 w-4" />
			<span class="ml-2 hidden sm:inline">Buat Proyek</span>
		</Button>
		{/snippet}
	</DialogTrigger>
	<DialogContent class="w-full max-w-lg" portalProps={{}}>
		<DialogHeader class="space-y-2">
			<DialogTitle class="text-xl font-semibold">Buat Proyek Baru</DialogTitle>
		</DialogHeader>
		<form 
			method="POST"
			onsubmit={handleSubmit}
		>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="name" class="text-right">Nama</Label>
					<Input name="name" id="name" type="text" placeholder="Nama Proyek" class="col-span-3" required />
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="description" class="text-right">Deskripsi</Label>
					<Input
						name="description"
						id="description"
						type="text"
						placeholder="Deskripsi Proyek"
						class="col-span-3"
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="dueDate" class="text-right">Deadline</Label>
					<div class="col-span-3 flex gap-2">
						<Popover.Root>
							<Popover.Trigger >
								{#snippet child({ props })}
								<Button
									variant="outline"
									class={cn(
										'w-full justify-start text-left font-normal',
										!dateValue && 'text-muted-foreground'
									)}
									{...props}
								>
									<CalendarIcon class="mr-2 h-4 w-4" />
									{#if dateValue}
										{new DateFormatter('en-US', { dateStyle: 'long' }).format(
											dateValue.toDate(getLocalTimeZone())
										)}
									{:else}
										<span>Pilih Tanggal</span>
									{/if}
								</Button>
								{/snippet}
							</Popover.Trigger>
							<Popover.Content class="w-auto p-0" portalProps={{}}>
								<Calendar 
									mode="single" 
									selected={dateValue} 
									bind:value={dateValue} 
									initialFocus 
									minDate={minDate}
									class="border rounded-md"
								/>
							</Popover.Content>
						</Popover.Root>
						<Popover.Root>
							<Popover.Trigger>
								{#snippet child({ props })}
								<Button
									variant="outline"
									class={cn(
										'w-full justify-start text-left font-normal',
										!timeValue && 'text-muted-foreground'
									)}
									{...props}
								>
									<ClockIcon class="mr-2 h-4 w-4" />
									{#if timeValue}
										{timeValue}
									{:else}
										<span>Pilih Waktu</span>
									{/if}
								</Button>
								{/snippet}
							</Popover.Trigger>
							<Popover.Content class="w-auto p-3" portalProps={{}}>
								<Input 
									type="time" 
									value={timeValue} 
									oninput={handleTimeInput}
									class="w-full"
								/>
							</Popover.Content>
						</Popover.Root>
					</div>
				</div>
				{#if formattedDateTime}
					<div class="grid grid-cols-4 items-center gap-4">
						<div class="col-start-2 col-span-3 text-sm text-muted-foreground">
							Selected: {formattedDateTime}
						</div>
					</div>
				{/if}
			</div>
			<DialogFooter class="flex justify-end space-x-2">
				<Button type="submit" disabled={isSubmitting} class=''>
					{#if isSubmitting}
						Membuat...
					{:else}
						Buat Proyek
					{/if}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
