<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { createEventDispatcher } from 'svelte';
	import { 
		Clock, 
		Calendar, 
		BookOpen, 
		PenTool, 
		Presentation, 
		FileText,
		Zap,
		Plus
	} from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	let { open = false }: { open?: boolean } = $props();

	// Quick action definitions
	const quickActions = [
		{
			id: 'deadline-today',
			name: 'Deadline Hari Ini',
			description: 'Tugas dengan deadline hari ini',
			icon: Clock,
			color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
			action: () => {
				const today = new Date();
				const deadline = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59);
				dispatch('quickAction', {
					type: 'deadline-today',
					data: {
						title: '',
						description: '',
						priority: 'High',
						status: 'Todo',
						deadline: deadline.toISOString(),
						label: 'general'
					}
				});
			}
		},
		{
			id: 'deadline-tomorrow',
			name: 'Deadline Besok',
			description: 'Tugas dengan deadline besok',
			icon: Calendar,
			color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
			action: () => {
				const tomorrow = new Date();
				tomorrow.setDate(tomorrow.getDate() + 1);
				const deadline = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59);
				dispatch('quickAction', {
					type: 'deadline-tomorrow',
					data: {
						title: '',
						description: '',
						priority: 'High',
						status: 'Todo',
						deadline: deadline.toISOString(),
						label: 'general'
					}
				});
			}
		},
		{
			id: 'next-week',
			name: 'Deadline Minggu Depan',
			description: 'Tugas dengan deadline minggu depan',
			icon: Calendar,
			color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
			action: () => {
				const nextWeek = new Date();
				nextWeek.setDate(nextWeek.getDate() + 7);
				const deadline = new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 23, 59);
				dispatch('quickAction', {
					type: 'next-week',
					data: {
						title: '',
						description: '',
						priority: 'Medium',
						status: 'Todo',
						deadline: deadline.toISOString(),
						label: 'general'
					}
				});
			}
		},
		{
			id: 'reading-assignment',
			name: 'Tugas Membaca',
			description: 'Buat tugas membaca dengan cepat',
			icon: BookOpen,
			color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
			action: () => {
				dispatch('quickAction', {
					type: 'reading-assignment',
					data: {
						title: 'Membaca: ',
						description: '📚 Tugas Membaca\n\n📖 Materi yang harus dibaca:\n- \n\n🎯 Target pemahaman:\n- \n\n📝 Catatan penting:\n- \n\n⏰ Estimasi waktu: __ jam',
						priority: 'Medium',
						status: 'Todo',
						label: 'tugas-harian'
					}
				});
			}
		},
		{
			id: 'assignment',
			name: 'Tugas Harian',
			description: 'Buat tugas harian dengan cepat',
			icon: PenTool,
			color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
			action: () => {
				dispatch('quickAction', {
					type: 'assignment',
					data: {
						title: 'Tugas: ',
						description: '📋 Deskripsi Tugas:\n\n🎯 Tujuan:\n- \n\n📝 Yang harus dikerjakan:\n1. \n2. \n3. \n\n📚 Referensi:\n- \n\n⏰ Estimasi waktu: __ jam',
						priority: 'Medium',
						status: 'Todo',
						label: 'tugas-harian'
					}
				});
			}
		},
		{
			id: 'presentation',
			name: 'Persiapan Presentasi',
			description: 'Buat tugas persiapan presentasi',
			icon: Presentation,
			color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
			action: () => {
				dispatch('quickAction', {
					type: 'presentation',
					data: {
						title: 'Presentasi: ',
						description: '🎤 Persiapan Presentasi\n\n📋 Topik: \n\n🎯 Tujuan presentasi:\n- \n\n📝 Outline presentasi:\n1. Pembukaan\n2. Isi utama\n3. Penutup\n\n📊 Slide yang perlu dibuat:\n- \n\n⏰ Durasi presentasi: __ menit\n⏰ Estimasi persiapan: __ jam',
						priority: 'High',
						status: 'Todo',
						label: 'presentasi'
					}
				});
			}
		},
		{
			id: 'report',
			name: 'Laporan',
			description: 'Buat tugas laporan dengan cepat',
			icon: FileText,
			color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
			action: () => {
				dispatch('quickAction', {
					type: 'report',
					data: {
						title: 'Laporan: ',
						description: '📄 Laporan\n\n📋 Jenis laporan: \n\n🎯 Tujuan:\n- \n\n📝 Struktur laporan:\n1. Pendahuluan\n2. Isi/Pembahasan\n3. Kesimpulan\n\n📊 Data yang diperlukan:\n- \n\n📚 Referensi:\n- \n\n📏 Target halaman: __ halaman\n⏰ Estimasi waktu: __ jam',
						priority: 'High',
						status: 'Todo',
						label: 'laporan'
					}
				});
			}
		},
		{
			id: 'study-session',
			name: 'Sesi Belajar',
			description: 'Buat jadwal sesi belajar',
			icon: Clock,
			color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
			action: () => {
				dispatch('quickAction', {
					type: 'study-session',
					data: {
						title: 'Belajar: ',
						description: '📚 Sesi Belajar\n\n📖 Mata kuliah: \n\n🎯 Topik yang dipelajari:\n- \n\n📝 Metode belajar:\n- Membaca\n- Latihan soal\n- Membuat ringkasan\n\n⏰ Durasi: __ jam\n📍 Lokasi: \n\n✅ Target setelah belajar:\n- ',
						priority: 'Medium',
						status: 'Todo',
						label: 'general'
					}
				});
			}
		}
	];

	function executeQuickAction(action: any) {
		action.action();
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button variant="outline" size="sm" class="gap-2" {...props}>
				<Zap class="h-4 w-4" />
				Quick Actions
			</Button>
		{/snippet}
	</Dialog.Trigger>
	
	<Dialog.Content class="max-w-4xl max-h-[80vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Zap class="h-5 w-5 text-primary" />
				Quick Actions
			</Dialog.Title>
			<Dialog.Description>
				Buat tugas dengan cepat menggunakan aksi-aksi yang sudah terdefinisi untuk kebutuhan akademik.
			</Dialog.Description>
		</Dialog.Header>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
			{#each quickActions as action}
				<Card.Root class="cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-primary/20 hover:scale-105">
					<Card.Header class="pb-3">
						<div class="flex items-center gap-3">
							<div class="p-2 rounded-lg {action.color}">
								<svelte:component this={action.icon} class="h-5 w-5" />
							</div>
							<div class="flex-1">
								<Card.Title class="text-base leading-tight">{action.name}</Card.Title>
							</div>
						</div>
					</Card.Header>
					
					<Card.Content class="pt-0">
						<p class="text-sm text-muted-foreground mb-4">{action.description}</p>
						
						<Button 
							size="sm" 
							class="w-full gap-2" 
							onclick={() => executeQuickAction(action)}
						>
							<Plus class="h-4 w-4" />
							Buat Tugas
						</Button>
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
	:global(.quick-action-card:hover) {
		transform: translateY(-2px) scale(1.02);
		transition: all 0.2s ease;
	}
</style>