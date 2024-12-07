import { writable } from 'svelte/store';
import type { Task } from '$lib/types';

function createTaskStore() {
	const { subscribe, set, update } = writable<Task[]>([]);

	const sortTasks = (tasks: Task[]) => {
		return [...tasks].sort((a, b) => 
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		);
	};

	return {
		subscribe,
		set: (tasks: Task[]) => {
			set(sortTasks(tasks));
		},
		addTask: (task: Task) => {
			update(tasks => {
				console.log('Menambahkan task:', task);
				const newTask = {
					...task,
					label: task.label ? (
						typeof task.label === 'string' 
							? task.label 
							: { ...task.label }
					) : null,
					createdAt: new Date().toISOString(),
				};
				return sortTasks([...tasks, newTask]);
			});
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
