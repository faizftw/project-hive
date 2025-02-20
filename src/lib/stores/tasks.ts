import { writable } from 'svelte/store';
import type { Task } from '$lib/types';
import { browser } from '$app/environment';

function createTaskStore() {
	const { subscribe, set, update } = writable<Task[]>([]);

	return {
		subscribe,
		set: (tasks: Task[]) => {
			if (browser) {
				const validTasks = tasks.filter(t => 
					t && 
					typeof t.id === 'string' && 
					typeof t.title === 'string'
				);
				set(validTasks);
			}
		},
		addTask: (task: Task) => {
			if (!task?.id || !task?.title) {
				console.error('Invalid task data:', task);
				return;
			}
			update(tasks => [...tasks, task]);
		},
		updateTask: (updatedTask: Task) => {
			if (!updatedTask?.id || !updatedTask?.title) {
				console.error('Invalid task data:', updatedTask);
				return;
			}
			
			update(tasks => {
				const index = tasks.findIndex(t => t.id === updatedTask.id);
				if (index === -1) {
					console.warn('Task not found in store:', updatedTask.id);
					return tasks;
				}
				const newTasks = [...tasks];
				newTasks[index] = {
					...newTasks[index],
					...updatedTask,
					label: updatedTask.label || null,
					priority: updatedTask.priority || 'Low',
					status: updatedTask.status || 'Pending'
				};
				return newTasks;
			});
		},
		deleteTask: (taskId: string) => {
			update(tasks => tasks.filter(t => t.id !== taskId));
		},
		update: (updater: (tasks: Task[]) => Task[]) => {
			if (browser) {
				update(updater);
			}
		}
	};
}

export const tasksStore = createTaskStore();
