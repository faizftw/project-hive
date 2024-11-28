<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from "$lib/components/ui/dialog";
	import { Input } from '$lib/components/ui/input';
	import { Label as LabelComponent } from '$lib/components/ui/label';
	import { createEventDispatcher } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { Task} from '$lib/types';
	import { CirclePlus } from 'lucide-svelte';
	import { tasksStore } from '$lib/stores/tasks';
	import { labels } from '../(data)/data.js';

	const dispatch = createEventDispatcher();

	export let projectId: string;

	let open = false;
	let title = '';
	let description = '';
	let priority: Task['priority'] = 'Low';
	let status: Task['status'] = 'Pending';
	let deadline = '';
	let label: string = 'general'; // Default label
	let isSubmitting = false;

	// Untuk membuat label baru
	let newLabel = '';
	let showNewLabelInput = false;

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		isSubmitting = true;

		// Jika pengguna menambahkan label baru
		let finalLabel = label;
		if (showNewLabelInput && newLabel.trim() !== '') {
			finalLabel = newLabel.trim().toLowerCase().replace(/\s+/g, '-');
			// Tambahkan label baru ke daftar labels (bisa juga kirim ke backend jika mendukung)
			labels.push({
				value: finalLabel,
				label: newLabel.trim()
			});
		}

		const newTask: Partial<Task> = {
			title,
			description,
			priority,
			status,
			deadline: deadline ? new Date(deadline).toISOString() : null,
			projectId,
			label: finalLabel,
		};

		// Debug: Tampilkan data yang akan dikirim
		console.log('Data yang dikirim ke API:', newTask);

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
				dispatch('taskAdded', result.task);
				toast.success('Task berhasil ditambahkan!');
				title = '';
				description = '';
				priority = 'Low';
				status = 'Pending';
				deadline = '';
				label = 'general';
				newLabel = '';
				showNewLabelInput = false;
				open = false;
			} else {
				// Ubah error menjadi lebih informatif
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
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button class='py-0 ml-auto me-2' size="sm">
			<CirclePlus class="mr-2 h-4 w-4" />
			Add Task
		</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Tambah Task Baru</Dialog.Title>
			<Dialog.Description>Isi detail tugas yang ingin ditambahkan.</Dialog.Description>
		</Dialog.Header>
		<form on:submit={handleSubmit} class="space-y-4">
			<div>
				<LabelComponent for="title">Judul</LabelComponent>
				<Input id="title" bind:value={title} required placeholder="Masukkan judul tugas" />
			</div>
			<div>
				<LabelComponent for="description">Deskripsi</LabelComponent>
				<Input id="description" bind:value={description} placeholder="Masukkan deskripsi tugas" />
			</div>
			<div>
				<LabelComponent for="priority">Prioritas</LabelComponent>
				<select id="priority" bind:value={priority} class="mt-1 block w-full">
					<option value="Low">Low</option>
					<option value="Medium">Medium</option>
					<option value="High">High</option>
				</select>
			</div>
			<div>
				<LabelComponent for="status">Status</LabelComponent>
				<select id="status" bind:value={status} class="mt-1 block w-full">
					<option value="Backlog">Backlog</option>
					<option value="Pending">Pending</option>
					<option value="Todo">Todo</option>
					<option value="In Progress">In Progress</option>
					<option value="Completed">Completed</option>
					<option value="Canceled">Canceled</option>
				</select>
			</div>
			<div>
				<LabelComponent for="label">Label</LabelComponent>
				<select id="label" bind:value={label} class="mt-1 block w-full" on:change={() => showNewLabelInput = label === 'add-new'}>
					{#each labels as lbl}
						<option value={lbl.value}>{lbl.label}</option>
					{/each}
					<option value="add-new">Tambah Label Baru</option>
				</select>
			</div>
			{#if showNewLabelInput}
				<div>
					<LabelComponent for="newLabel">Label Baru</LabelComponent>
					<Input id="newLabel" bind:value={newLabel} placeholder="Masukkan label baru" required />
				</div>
			{/if}
			<div>
				<LabelComponent for="deadline">Batas Waktu</LabelComponent>
				<Input id="deadline" type="datetime-local" bind:value={deadline} />
			</div>
			<div class="flex justify-end space-x-2">
				<Button type="button" variant="outline" on:click={() => open = false}>Batal</Button>
				<Button type="submit" disabled={isSubmitting}>
					{#if isSubmitting}
						Loading...
					{:else}
						Simpan
					{/if}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>