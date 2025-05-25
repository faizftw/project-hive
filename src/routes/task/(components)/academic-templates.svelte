<script lang="ts">
	import { academicTemplates } from '../(data)/data';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { createEventDispatcher } from 'svelte';
	import { BookOpen, Zap } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	let { open = false }: { open?: boolean } = $props();

	function applyTemplate(template: any) {
		dispatch('templateSelected', template);
		open = false;
	}

	function getPriorityColor(priority: string) {
		switch (priority) {
			case 'High':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			case 'Medium':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'Low':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button variant="outline" size="sm" class="gap-2" {...props}>
				<BookOpen class="h-4 w-4" />
				Template Akademik
			</Button>
		{/snippet}
	</Dialog.Trigger>
	
	<Dialog.Content class="max-w-4xl max-h-[80vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Zap class="h-5 w-5 text-primary" />
				Template Tugas Akademik
			</Dialog.Title>
			<Dialog.Description>
				Pilih template tugas akademik untuk mempercepat pembuatan tugas dengan format yang sudah terstruktur.
			</Dialog.Description>
		</Dialog.Header>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
			{#each academicTemplates as template}
				<Card.Root class="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20">
					<Card.Header class="pb-3">
						<div class="flex items-start justify-between">
							<div class="flex items-center gap-3">
								<span class="text-2xl">{template.icon}</span>
								<div>
									<Card.Title class="text-lg">{template.name}</Card.Title>
									<div class="flex gap-2 mt-1">
										<Badge variant="outline" class={getPriorityColor(template.template.priority)}>
											{template.template.priority}
										</Badge>
										<Badge variant="secondary">
											{template.template.label}
										</Badge>
									</div>
								</div>
							</div>
						</div>
					</Card.Header>
					
					<Card.Content class="pt-0">
						<div class="space-y-3">
							<div>
								<h4 class="font-medium text-sm text-muted-foreground mb-1">Judul Template:</h4>
								<p class="text-sm font-medium">{template.template.title}</p>
							</div>
							
							<div>
								<h4 class="font-medium text-sm text-muted-foreground mb-1">Preview Deskripsi:</h4>
								<div class="text-xs text-muted-foreground bg-muted/50 p-2 rounded max-h-20 overflow-y-auto">
									{#each template.template.description.split('\n').slice(0, 3) as line}
										<p>{line}</p>
									{/each}
									{#if template.template.description.split('\n').length > 3}
										<p class="text-xs text-muted-foreground/70">... dan {template.template.description.split('\n').length - 3} baris lainnya</p>
									{/if}
								</div>
							</div>
							
							<Button 
								size="sm" 
								class="w-full" 
								onclick={() => applyTemplate(template.template)}
							>
								Gunakan Template
							</Button>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
		
		<div class="flex justify-end pt-4 border-t">
			<Button variant="outline" onclick={() => open = false}>
				Tutup
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>

<style>
	:global(.academic-template-card:hover) {
		transform: translateY(-2px);
		transition: transform 0.2s ease;
	}
</style>