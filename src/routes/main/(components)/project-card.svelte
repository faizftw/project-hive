<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Project } from '$lib/types';

	export let project: Project;

	// Validasi data project
	$: {
		if (!project?.id || !project?.name) {
			console.error('Invalid project data:', project);
		}
	}

	function formatDate(date: string | null) {
		if (!date) return 'Not set';
		
		try {
			const dateObj = new Date(date);
			
			if (isNaN(dateObj.getTime())) {
				console.error('Invalid date value:', date);
				return 'Not set';
			}

			return new Intl.DateTimeFormat('id-ID', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			}).format(dateObj);
		} catch (err) {
			console.error('Error formatting date:', err);
			return 'Not set';
		}
	}
</script>

{#if project && project.id}
	<Card.Root>
		<Card.Header>
			<Card.Title>{project.name || 'Untitled Project'}</Card.Title>
			<Card.Description>{project.description || 'No description'}</Card.Description>
		</Card.Header>
		<Card.Content>
			<p>Status: {project.status || 'Unknown'}</p>
			<p>Created: {project.createdAt ? formatDate(project.createdAt) : 'Not set'}</p>
			<p>Due: {project.dueDate ? formatDate(project.dueDate) : 'Not set'}</p>
		</Card.Content>
	</Card.Root>
{/if}
