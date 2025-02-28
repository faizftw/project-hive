<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import GalleryVerticalEnd from 'lucide-svelte/icons/gallery-vertical-end';
	import { projectsStore } from '$lib/stores/projects';
	import { getLocalTimeZone, today, parseDate, CalendarDate } from "@internationalized/date";
	import { RangeCalendar } from "$lib/components/ui/range-calendar/index.js";
	import type { ComponentProps } from 'svelte';
	import { formatDate } from "date-fns";


	let {
		ref = $bindable(null),
		projectId,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { projectId: string } = $props();

	const project = $projectsStore.find(p => p.id === projectId);         
	const projectDeadline = project?.dueDate;
	console.log(projectDeadline);
	console.log(project);
	
	// Start date is today
	const start = today(getLocalTimeZone());
	
	// Fungsi untuk mendapatkan end date
	function getEndDate() {
		if (projectDeadline) {
			try {
				// Mengikuti format di edit-task.svelte
				const date = new Date(projectDeadline);
				const dateStr = date.toISOString().split('T')[0];
				console.log(dateStr);
				console.log(parseDate(dateStr));
				return parseDate(dateStr);
			} catch (error) {
				console.error('Error parsing project deadline:', error);
				return start;
			}
		} else {
			// Fallback to today's date if no deadline exists
			return start;
		}
		
	}

	// Inisialisasi value di luar $derived
	let value = $state({
		start,
		end: start // Default ke start, akan diupdate oleh effect
	});

	// Update value.end ketika projectDeadline berubah
	$effect(() => {
		try {
			value.end = getEndDate();
		} catch (error) {
			console.error('Error updating end date:', error);
			value.end = start; // Fallback ke start jika ada error
		}
	});
</script>

<Sidebar.Root variant="floating" {...restProps}>
	<Sidebar.Header>
		<h2 class="text-2xl font-bold tracking-tight">Project Details</h2>
	</Sidebar.Header>
	<Sidebar.Content>
		<RangeCalendar 
			bind:value 
			class="rounded-md border" 
			readonly={true}
			locale="en"
		/>
	</Sidebar.Content>
</Sidebar.Root>