<script lang="ts">
	import Add from 'lucide-svelte/icons/circle-plus';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import ClockIcon from 'lucide-svelte/icons/clock';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import type { ActionResult, SubmitFunction } from '@sveltejs/kit';
	import type { Project } from '$lib/types';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogTrigger,
		DialogFooter
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { createEventDispatcher } from 'svelte';
	import type { DateValue } from '@internationalized/date';
	import { DateFormatter, getLocalTimeZone } from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { projectsStore } from '$lib/stores/projects';

	const dispatch = createEventDispatcher<{
		projectAdded: { data: Project };
	}>();

	let open = false;
	let isSubmitting = false;
	let dateValue: DateValue | null = null;
	let timeValue = '';
	let formattedDateTime: string | null = null;

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

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		
		if (formattedDateTime) {
			formData.append('dueDate', formattedDateTime);
		}

		isSubmitting = true;
		
		fetch('?/createProject', {
			method: 'POST',
			body: formData
		})
		.then(async (response) => {
			const result = await response.json();
			console.log('Raw server response:', result);

			// Parse data string menjadi array
			const parsedData = JSON.parse(result.data);
			console.log('Parsed data:', parsedData);

			// Extract project data dengan index yang benar
			const newProject: Project = {
				id: parsedData[4],          // ID project
				name: parsedData[5],        // Nama project
				description: parsedData[6],  // Deskripsi
				status: parsedData[7],      // Status
				dueDate: parsedData[8],     // Due date
				createdAt: parsedData[9],   // Created at
				createdById: parsedData[10], // Created by ID
				createdBy: {
					id: parsedData[10],     // Same as createdById
					name: parsedData[12],    // Creator name
					email: parsedData[13]    // Creator email
				}
			};

			console.log('Formatted project:', newProject);

			if (!newProject.id || !newProject.name) {
				throw new Error('Invalid project data received');
			}

			projectsStore.addProject(newProject);

			form.reset();
			dateValue = null;
			timeValue = '';
			open = false;
			dispatch('projectAdded', { data: newProject });
		})
		.catch((err) => {
			console.error('Error creating project:', err);
			alert(err.message);
		})
		.finally(() => {
			isSubmitting = false;
		});
	}
</script>

<Dialog bind:open>
	<DialogTrigger>
		<Button>
			<Add class="mr-2 h-4 w-4" />
			Add Project
		</Button>
	</DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Create New Project</DialogTitle>
		</DialogHeader>
		<form 
			method="POST"
			on:submit={handleSubmit}
		>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="name" class="text-right">Name</Label>
					<Input name="name" id="name" placeholder="Project name" class="col-span-3" required />
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="description" class="text-right">Description</Label>
					<Input
						name="description"
						id="description"
						placeholder="Project description"
						class="col-span-3"
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="dueDate" class="text-right">Deadline</Label>
					<div class="col-span-3 flex gap-2">
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
								<Calendar mode="single" selected={dateValue} bind:value={dateValue} initialFocus />
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
					<div class="grid grid-cols-4 items-center gap-4">
						<div class="col-start-2 col-span-3 text-sm text-muted-foreground">
							Selected: {formattedDateTime}
						</div>
					</div>
				{/if}
			</div>
			<DialogFooter>
				<Button type="submit" disabled={isSubmitting}>
					{#if isSubmitting}
						Creating...
					{:else}
						Create Project
					{/if}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
