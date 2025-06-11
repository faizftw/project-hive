<script lang="ts">
	import { Bell, Clock, AlertTriangle, CheckCircle } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { tasksStore } from '$lib/stores/tasks';
	import { projectsStore } from '$lib/stores/projects';
	import { fade } from 'svelte/transition';
    import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

	interface Notification {
		id: string;
		type: 'overdue' | 'due-today' | 'due-tomorrow' | 'due-week';
		title: string;
		message: string;
		date: string;
		icon: any;
		color: string;
	}

	// Reactive state untuk notifikasi
	let notifications: Notification[] = $state([]);
	let unreadCount: number = $state(0);

	// Effect untuk menghitung notifikasi berdasarkan tasks dan projects
	$effect(() => {
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);
		const nextWeek = new Date(today);
		nextWeek.setDate(nextWeek.getDate() + 7);

		const newNotifications: Notification[] = [];

		// Cek tasks yang mendekati deadline
		$tasksStore.forEach(task => {
			if (task.deadline && task.status !== 'Completed') {
				const dueDate = new Date(task.deadline);
				
				// Task overdue
				if (dueDate < today) {
					newNotifications.push({
						id: `task-overdue-${task.id}`,
						type: 'overdue',
						title: 'Task Terlambat',
						message: `"${task.title}" sudah melewati deadline`,
						date: task.deadline,
						icon: AlertTriangle,
						color: 'destructive'
					});
				}
				// Task due today
				else if (dueDate.toDateString() === today.toDateString()) {
					newNotifications.push({
						id: `task-today-${task.id}`,
						type: 'due-today',
						title: 'Deadline Hari Ini',
						message: `"${task.title}" harus diselesaikan hari ini`,
						date: task.deadline,
						icon: Clock,
						color: 'destructive'
					});
				}
				// Task due tomorrow
				else if (dueDate.toDateString() === tomorrow.toDateString()) {
					newNotifications.push({
						id: `task-tomorrow-${task.id}`,
						type: 'due-tomorrow',
						title: 'Deadline Besok',
						message: `"${task.title}" akan jatuh tempo besok`,
						date: task.deadline,
						icon: Clock,
						color: 'secondary'
					});
				}
				// Task due this week
				else if (dueDate <= nextWeek) {
					newNotifications.push({
						id: `task-week-${task.id}`,
						type: 'due-week',
						title: 'Deadline Minggu Ini',
						message: `"${task.title}" akan jatuh tempo dalam minggu ini`,
						date: task.deadline,
						icon: Clock,
						color: 'outline'
					});
				}
			}
		});

		// Cek projects yang mendekati deadline
		$projectsStore.forEach(project => {
			if (project.dueDate && project.status !== 'Completed') {
				const dueDate = new Date(project.dueDate);
				
				// Project overdue
				if (dueDate < today) {
					newNotifications.push({
						id: `project-overdue-${project.id}`,
						type: 'overdue',
						title: 'Proyek Terlambat',
						message: `Proyek "${project.name}" sudah melewati deadline`,
						date: project.dueDate,
						icon: AlertTriangle,
						color: 'destructive'
					});
				}
				// Project due today
				else if (dueDate.toDateString() === today.toDateString()) {
					newNotifications.push({
						id: `project-today-${project.id}`,
						type: 'due-today',
						title: 'Deadline Proyek Hari Ini',
						message: `Proyek "${project.name}" harus diselesaikan hari ini`,
						date: project.dueDate,
						icon: Clock,
						color: 'destructive'
					});
				}
			}
		});

		// Sort notifications by priority (overdue first, then by date)
		newNotifications.sort((a, b) => {
			if (a.type === 'overdue' && b.type !== 'overdue') return -1;
			if (b.type === 'overdue' && a.type !== 'overdue') return 1;
			return new Date(a.date).getTime() - new Date(b.date).getTime();
		});

		notifications = newNotifications;
		unreadCount = newNotifications.length;
	});

	// Function untuk format tanggal
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		if (date.toDateString() === today.toDateString()) {
			return 'Hari ini';
		} else if (date.toDateString() === tomorrow.toDateString()) {
			return 'Besok';
		} else {
			return date.toLocaleDateString('id-ID', {
				weekday: 'short',
				day: 'numeric',
				month: 'short'
			});
		}
	}

	// Function untuk menandai notifikasi sebagai dibaca
	function markAsRead() {
		unreadCount = 0;
	}
</script>

<Popover.Root>
	<Popover.Trigger>
        {#snippet child({ props })}
		<Button
			variant="ghost"
			size="icon"
			class="relative hover:bg-accent"
			onclick={markAsRead}
            {...props}
		>
			<Bell class="h-5 w-5" />
			{#if unreadCount > 0}
				<Badge
					variant="destructive"
					class="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
					transition={fade}
				>
					{unreadCount > 99 ? '99+' : unreadCount}
				</Badge>
			{/if}
			<span class="sr-only">Notifikasi</span>
		</Button>
        {/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-80 p-0" align="end" sideOffset={4}>
		<div class="p-4">
			<h3 class="font-semibold text-sm">Notifikasi</h3>
			<p class="text-xs text-muted-foreground mt-1">
				{notifications.length === 0 ? 'Tidak ada notifikasi' : `${notifications.length} notifikasi`}
			</p>
		</div>
		<Separator />
		
		{#if notifications.length === 0}
			<div class="p-4 text-center text-sm text-muted-foreground">
				<CheckCircle class="h-8 w-8 mx-auto mb-2 text-green-500" />
				Semua tugas dan proyek Anda up to date!
			</div>
		{:else}
			<ScrollArea class="h-80">
				<div class="p-0">
					{#each notifications as notification, index (notification.id)}
						<div class="p-4 hover:bg-accent/50 transition-colors">
							<div class="flex items-start gap-3">
								<div class="flex-shrink-0 mt-0.5">
									<svelte:component
										this={notification.icon}
										class="h-4 w-4 {notification.type === 'overdue' ? 'text-red-500' : notification.type === 'due-today' ? 'text-orange-500' : 'text-blue-500'}"
									/>
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2 mb-1">
										<p class="text-sm font-medium">{notification.title}</p>
										<Badge variant={notification.color} class="text-xs">
											{formatDate(notification.date)}
										</Badge>
									</div>
									<p class="text-xs text-muted-foreground leading-relaxed">
										{notification.message}
									</p>
								</div>
							</div>
						</div>
						{#if index < notifications.length - 1}
							<Separator class="my-2" />
						{/if}
					{/each}
				</div>
			</ScrollArea>
		{/if}
	</Popover.Content>
</Popover.Root>