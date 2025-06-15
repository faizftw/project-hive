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
		type: 'overdue' | 'due-today' | 'due-tomorrow' | 'due-week' | 'reminder-3days' | 'reminder-week';
		title: string;
		message: string;
		date: string;
		icon: any;
		color: string;
		priority: number; // 1 = highest, 5 = lowest
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
		const threeDaysLater = new Date(today);
		threeDaysLater.setDate(threeDaysLater.getDate() + 3);
		const oneWeekLater = new Date(today);
		oneWeekLater.setDate(oneWeekLater.getDate() + 7);

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
						color: 'destructive',
						priority: 1
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
						color: 'destructive',
						priority: 2
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
						color: 'secondary',
						priority: 3
					});
				}
				// Task due in 3 days (reminder)
				else if (dueDate.toDateString() === threeDaysLater.toDateString()) {
					newNotifications.push({
						id: `task-3days-${task.id}`,
						type: 'reminder-3days',
						title: 'Reminder: 3 Hari Lagi',
						message: `"${task.title}" akan jatuh tempo dalam 3 hari`,
						date: task.deadline,
						icon: Clock,
						color: 'outline',
						priority: 4
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
						color: 'outline',
						priority: 5
					});
				}
				// Task reminder 1 week before (for tasks with longer deadlines)
				else if (dueDate.toDateString() === oneWeekLater.toDateString()) {
					newNotifications.push({
						id: `task-weekreminder-${task.id}`,
						type: 'reminder-week',
						title: 'Reminder: 1 Minggu Lagi',
						message: `"${task.title}" akan jatuh tempo dalam 1 minggu`,
						date: task.deadline,
						icon: Clock,
						color: 'outline',
						priority: 6
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
						color: 'destructive',
						priority: 1
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
						color: 'destructive',
						priority: 2
					});
				}
				// Project due tomorrow
				else if (dueDate.toDateString() === tomorrow.toDateString()) {
					newNotifications.push({
						id: `project-tomorrow-${project.id}`,
						type: 'due-tomorrow',
						title: 'Deadline Proyek Besok',
						message: `Proyek "${project.name}" akan jatuh tempo besok`,
						date: project.dueDate,
						icon: Clock,
						color: 'secondary',
						priority: 3
					});
				}
				// Project due in 3 days (reminder)
				else if (dueDate.toDateString() === threeDaysLater.toDateString()) {
					newNotifications.push({
						id: `project-3days-${project.id}`,
						type: 'reminder-3days',
						title: 'Reminder Proyek: 3 Hari Lagi',
						message: `Proyek "${project.name}" akan jatuh tempo dalam 3 hari`,
						date: project.dueDate,
						icon: Clock,
						color: 'outline',
						priority: 4
					});
				}
				// Project due this week
				else if (dueDate <= nextWeek) {
					newNotifications.push({
						id: `project-week-${project.id}`,
						type: 'due-week',
						title: 'Deadline Proyek Minggu Ini',
						message: `Proyek "${project.name}" akan jatuh tempo dalam minggu ini`,
						date: project.dueDate,
						icon: Clock,
						color: 'outline',
						priority: 5
					});
				}
				// Project reminder 1 week before
				else if (dueDate.toDateString() === oneWeekLater.toDateString()) {
					newNotifications.push({
						id: `project-weekreminder-${project.id}`,
						type: 'reminder-week',
						title: 'Reminder Proyek: 1 Minggu Lagi',
						message: `Proyek "${project.name}" akan jatuh tempo dalam 1 minggu`,
						date: project.dueDate,
						icon: Clock,
						color: 'outline',
						priority: 6
					});
				}
			}
		});

		// Sort notifikasi berdasarkan priority (1 = highest priority)
		notifications = newNotifications.sort((a, b) => {
			// Sort by priority first (lower number = higher priority)
			if (a.priority !== b.priority) {
				return a.priority - b.priority;
			}
			// If same priority, sort by date (earlier dates first)
			return new Date(a.date).getTime() - new Date(b.date).getTime();
		});
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
									
									<notification.icon
									class="h-4 w-4 {notification.type === 'overdue' ? 'text-red-500' : 
										notification.type === 'due-today' ? 'text-orange-500' : 
										notification.type === 'due-tomorrow' ? 'text-yellow-500' : 
										notification.type === 'reminder-3days' ? 'text-blue-500' : 
										notification.type === 'reminder-week' ? 'text-green-500' : 'text-blue-500'}"
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