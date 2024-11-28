import {ArrowDown, ArrowRight, ArrowUp, CheckCircled, Circle, CrossCircled, QuestionMarkCircled, Stopwatch, Pause } from 'svelte-radix';



export const labels = [
	{
		value: 'bug',
		label: 'Bug'
	},
	{
		value: 'feature',
		label: 'Feature'
	},
	{
		value: 'documentation',
		label: 'Documentation'
	},
	{
		value: 'general',
		label: 'General'
	}
];

export const statuses = [
	{
		value: 'Backlog',
		label: 'Backlog',
		icon: QuestionMarkCircled
	},
	{
		value: 'Pending',
		label: 'Pending',
		icon: QuestionMarkCircled
	},
	{
		value: 'Todo',
		label: 'Todo',
		icon: Circle
	},
	{
		value: 'In progress',
		label: 'In Progress',
		icon: Stopwatch
	},
	{
		value: 'Completed',
		label: 'Completed',
		icon: CheckCircled
	},
	{
		value: 'Canceled',
		label: 'Canceled',
		icon: CrossCircled
	}
];

export const priorities = [
	{
		label: 'Low',
		value: 'Low',
		icon: ArrowDown
	},
	{
		label: 'Medium',
		value: 'Medium',
		icon: ArrowRight
	},
	{
		label: 'High',
		value: 'High',
		icon: ArrowUp
	}
];
