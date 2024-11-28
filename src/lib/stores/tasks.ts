import { writable } from 'svelte/store';
import type { Task } from '$lib/types';

function createTaskStore() {
	const { subscribe, set, update } = writable<Task[]>([]);

	return {
		subscribe,
		set: (tasks: Task[]) => set(tasks),
		addTask: (task: Task) => {
			if (!task?.id || typeof task.id !== 'string' || !task?.title) {
				console.error('Data task tidak valid:', task);
				return;
			}
			if (task.label === undefined) {
				task.label = null;
			}
			update(tasks => [task, ...tasks]);
		},
		deleteTask: (taskId: string) => {
			update(tasks => tasks.filter(t => t.id !== taskId));
		},
		updateTask: (updatedTask: Task) => {
			update(tasks => tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
		}
	};
}

export const tasksStore = createTaskStore();
