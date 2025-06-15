<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { projectsStore } from '$lib/stores/projects';
	import { tasksStore } from '$lib/stores/tasks';
	import { derived } from 'svelte/store';
	import { 
		BarChart3, 
		TrendingUp, 
		TrendingDown, 
		Calendar, 
		Clock,
		Target,
		Activity,
		PieChart
	} from 'lucide-svelte';
	import type { ComponentProps } from 'svelte';
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

	let {
		ref = $bindable(null),
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();

	// Analytics calculations
	const analytics = derived([projectsStore, tasksStore], ([$projects, $tasks]) => {
		const totalProjects = $projects.length;
		const totalTasks = $tasks.length;
		
		// Project analytics
		const completedProjects = $projects.filter(p => p.status === 'completed').length;
		const activeProjects = $projects.filter(p => p.status === 'active').length;
		const overdueProjects = $projects.filter(p => {
			if (p.dueDate && p.status !== 'completed') {
				return new Date(p.dueDate) < new Date();
			}
			return false;
		}).length;
		
		// Task analytics
		const completedTasks = $tasks.filter(t => t.status === 'Completed').length;
		const inProgressTasks = $tasks.filter(t => t.status === 'In Progress').length;
		const overdueTasks = $tasks.filter(t => t.status === 'Overdue').length;
		const todoTasks = $tasks.filter(t => t.status === 'Todo').length;
		
		// Productivity metrics
		const projectCompletionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
		const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
		
		// Priority distribution
		const highPriorityTasks = $tasks.filter(t => t.priority === 'High').length;
		const mediumPriorityTasks = $tasks.filter(t => t.priority === 'Medium').length;
		const lowPriorityTasks = $tasks.filter(t => t.priority === 'Low').length;
		
		// Recent activity (tasks created in last 7 days)
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		const recentTasks = $tasks.filter(t => new Date(t.createdAt) >= sevenDaysAgo).length;
		
		// Upcoming deadlines (next 7 days)
		const nextWeek = new Date();
		nextWeek.setDate(nextWeek.getDate() + 7);
		const upcomingDeadlines = $tasks.filter(t => {
			if (t.deadline && t.status !== 'Completed') {
				const deadline = new Date(t.deadline);
				return deadline >= new Date() && deadline <= nextWeek;
			}
			return false;
		}).length;
		
		return {
			totalProjects,
			totalTasks,
			completedProjects,
			activeProjects,
			overdueProjects,
			completedTasks,
			inProgressTasks,
			overdueTasks,
			todoTasks,
			projectCompletionRate,
			taskCompletionRate,
			highPriorityTasks,
			mediumPriorityTasks,
			lowPriorityTasks,
			recentTasks,
			upcomingDeadlines
		};
	});
</script>

<Sidebar.Root variant="floating" {...restProps}>
	<Sidebar.Header class="p-4">
		<div class="flex items-center gap-2">
			<BarChart3 class="h-5 w-5" />
			<h2 class="text-xl font-bold tracking-tight">Analytics Dashboard</h2>
		</div>
	</Sidebar.Header>
	
	<Sidebar.Content class="space-y-4">
		<ScrollArea class='h-full p-4'>
		<!-- Overview Stats -->
		<Sidebar.Group>
			<h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
				<Activity class="h-4 w-4" />
				Overview
			</h3>
			<div class="grid grid-cols-2 gap-2">
				<Card.Root class="p-3">
					<div class="text-center">
						<div class="text-2xl font-bold text-blue-600">{$analytics.totalProjects}</div>
						<div class="text-xs text-muted-foreground">Total Projects</div>
					</div>
				</Card.Root>
				<Card.Root class="p-3">
					<div class="text-center">
						<div class="text-2xl font-bold text-green-600">{$analytics.totalTasks}</div>
						<div class="text-xs text-muted-foreground">Total Tasks</div>
					</div>
				</Card.Root>
			</div>
		</Sidebar.Group>

		<!-- Completion Rates -->
		<Sidebar.Group>
			<h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
				<Target class="h-4 w-4" />
				Completion Rates
			</h3>
			<div class="space-y-3">
				<div>
					<div class="flex justify-between text-sm mb-1">
						<span>Projects</span>
						<span class="font-medium">{$analytics.projectCompletionRate.toFixed(1)}%</span>
					</div>
					<Progress value={$analytics.projectCompletionRate} class="h-2" />
				</div>
				<div>
					<div class="flex justify-between text-sm mb-1">
						<span>Tasks</span>
						<span class="font-medium">{$analytics.taskCompletionRate.toFixed(1)}%</span>
					</div>
					<Progress value={$analytics.taskCompletionRate} class="h-2" />
				</div>
			</div>
		</Sidebar.Group>

		<!-- Project Status -->
		<Sidebar.Group>
			<h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
				<PieChart class="h-4 w-4" />
				Project Status
			</h3>
			<div class="space-y-2">
				<div class="flex justify-between items-center">
					<Badge variant="outline" class="text-green-600 border-green-600">Completed</Badge>
					<span class="font-medium">{$analytics.completedProjects}</span>
				</div>
				<div class="flex justify-between items-center">
					<Badge variant="outline" class="text-blue-600 border-blue-600">Active</Badge>
					<span class="font-medium">{$analytics.activeProjects}</span>
				</div>
				<div class="flex justify-between items-center">
					<Badge variant="outline" class="text-red-600 border-red-600">Overdue</Badge>
					<span class="font-medium">{$analytics.overdueProjects}</span>
				</div>
			</div>
		</Sidebar.Group>

		<!-- Task Priority Distribution -->
		<Sidebar.Group>
			<h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
				<TrendingUp class="h-4 w-4" />
				Task Priority
			</h3>
			<div class="space-y-2">
				<div class="flex justify-between items-center">
					<Badge variant="destructive">High</Badge>
					<span class="font-medium">{$analytics.highPriorityTasks}</span>
				</div>
				<div class="flex justify-between items-center">
					<Badge variant="secondary">Medium</Badge>
					<span class="font-medium">{$analytics.mediumPriorityTasks}</span>
				</div>
				<div class="flex justify-between items-center">
					<Badge variant="outline">Low</Badge>
					<span class="font-medium">{$analytics.lowPriorityTasks}</span>
				</div>
			</div>
		</Sidebar.Group>

		<!-- Recent Activity -->
		<Sidebar.Group>
			<h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
				<Clock class="h-4 w-4" />
				Recent Activity
			</h3>
			<div class="space-y-2">
				<Card.Root class="p-3">
					<div class="flex items-center justify-between">
						<div>
							<div class="text-sm font-medium">New Tasks (7 days)</div>
							<div class="text-xs text-muted-foreground">Recently created</div>
						</div>
						<div class="text-xl font-bold text-blue-600">{$analytics.recentTasks}</div>
					</div>
				</Card.Root>
			</div>
		</Sidebar.Group>

		<!-- Upcoming Deadlines -->
		<Sidebar.Group>
			<h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
				<Calendar class="h-4 w-4" />
				Upcoming Deadlines
			</h3>
			<Card.Root class="p-3">
				<div class="flex items-center justify-between">
					<div>
						<div class="text-sm font-medium">Next 7 Days</div>
						<div class="text-xs text-muted-foreground">Tasks due soon</div>
					</div>
					<div class="text-xl font-bold text-amber-600">{$analytics.upcomingDeadlines}</div>
				</div>
			</Card.Root>
		</Sidebar.Group>

		<!-- Task Status Summary -->
		<Sidebar.Group>
			<h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
				<TrendingDown class="h-4 w-4" />
				Task Status
			</h3>
			<div class="grid grid-cols-2 gap-2 text-xs">
				<div class="bg-green-50 dark:bg-green-900/20 p-2 rounded text-center">
					<div class="font-bold text-green-600">{$analytics.completedTasks}</div>
					<div class="text-green-600">Completed</div>
				</div>
				<div class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">
					<div class="font-bold text-blue-600">{$analytics.inProgressTasks}</div>
					<div class="text-blue-600">In Progress</div>
				</div>
				<div class="bg-gray-50 dark:bg-gray-900/20 p-2 rounded text-center">
					<div class="font-bold text-gray-600">{$analytics.todoTasks}</div>
					<div class="text-gray-600">Todo</div>
				</div>
				<div class="bg-red-50 dark:bg-red-900/20 p-2 rounded text-center">
					<div class="font-bold text-red-600">{$analytics.overdueTasks}</div>
					<div class="text-red-600">Overdue</div>
				</div>
			</div>
		</Sidebar.Group>
	</ScrollArea>
	</Sidebar.Content>
</Sidebar.Root>