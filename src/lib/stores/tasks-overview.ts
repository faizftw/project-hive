import { writable } from 'svelte/store';
import type { Task } from '$lib/types';
import { browser } from '$app/environment';

// Interface yang diperluas untuk Task yang mungkin memiliki properti tambahan
interface TaskWithMetadata extends Task {
    updatedAt?: string;
    createdBy?: any;
    project?: any;
}

function normalizeTask(task: any): TaskWithMetadata {
    try {
        // Validasi dasar untuk memastikan objek task
        if (!task || typeof task !== 'object') {
            throw new Error('Invalid task data');
        }

        // Pastikan URL dalam format yang konsisten
        let normalizedUrl = null;
        if (task.url) {
            try {
                // Jika URL berbentuk string, coba parsing sebagai JSON
                if (typeof task.url === 'string') {
                    try {
                        normalizedUrl = JSON.parse(task.url);
                    } catch (e) {
                        // Jika parsing gagal, buat objek URL sederhana
                        normalizedUrl = { url: task.url, alias: null };
                    }
                } else if (typeof task.url === 'object') {
                    // Jika URL sudah berupa objek, gunakan sebagaimana adanya
                    normalizedUrl = {
                        url: task.url.url || '',
                        alias: task.url.alias || null
                    };
                }
            } catch (e) {
                normalizedUrl = null;
            }
        }

        // Pastikan label dalam format yang konsisten
        let normalizedLabel = null;
        if (task.label) {
            if (typeof task.label === 'string') {
                normalizedLabel = { value: task.label, label: task.label };
            } else if (typeof task.label === 'object' && task.label !== null) {
                normalizedLabel = {
                    value: task.label.value || 'general',
                    label: task.label.label || 'General'
                };
            }
        }

        // Normalize task dengan nilai default yang aman
        return {
            id: task.id || '',
            title: task.title || '',
            description: task.description || null,
            priority: task.priority || 'Low',
            status: task.status || 'Pending',
            deadline: task.deadline || null,
            projectId: task.projectId || '',
            createdById: task.createdById || task.createdBy?.id || '',
            label: normalizedLabel,
            url: normalizedUrl,
            createdAt: task.createdAt || new Date().toISOString(),
            updatedAt: task.updatedAt || new Date().toISOString(),
            createdBy: task.createdBy || null,
            project: task.project || null
        };
    } catch (error) {
        // Return minimal valid task object
        return {
            id: task?.id || 'error',
            title: task?.title || 'Error Task',
            description: null,
            priority: 'Low',
            status: 'Pending',
            deadline: null,
            projectId: task?.projectId || '',
            createdById: task?.createdById || '',
            label: null,
            url: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: null,
            project: null
        };
    }
}

// Fungsi untuk memeriksa dan mengubah status task yang melewati deadline
function checkOverdueTasks(tasks: TaskWithMetadata[]): TaskWithMetadata[] {
    const now = new Date();
    
    return tasks.map(task => {
        // Skip jika task sudah selesai atau dibatalkan
        if (task.status === 'Completed' || task.status === 'Canceled') {
            return task;
        }
        
        // Jika status Overdue dan deadline diperpanjang, ubah status menjadi In Progress
        if ((task.status as string) === 'Overdue' && task.deadline) {
            try {
                const deadlineDate = new Date(task.deadline);
                if (deadlineDate > now) {
                    return {
                        ...task,
                        status: 'In Progress'
                    };
                }
            } catch (e) {
                // Jika ada error dalam parsing tanggal, biarkan task seperti semula
            }
            return task;
        }
        
        // Skip jika tidak ada deadline
        if (!task.deadline) {
            return task;
        }
        
        try {
            const deadlineDate = new Date(task.deadline);
            
            // Jika deadline sudah lewat, ubah status menjadi Overdue
            if (deadlineDate < now) {
                return {
                    ...task,
                    status: 'Overdue'
                };
            }
        } catch (e) {
            // Jika ada error dalam parsing tanggal, biarkan task seperti semula
        }
        
        return task;
    });
}

function createTasksOverviewStore() {
    const { subscribe, set, update } = writable<TaskWithMetadata[]>([]);

    return {
        subscribe,
        set: (tasks: Task[]) => {
            if (browser) {
                try {
                    // Filter dan validasi tasks
                    const validTasks = tasks
                        .filter(t => t && typeof t === 'object' && t.id)
                        .map(task => {
                            try {
                                return normalizeTask(task);
                            } catch (e) {
                                return null;
                            }
                        })
                        .filter(Boolean) as TaskWithMetadata[];
                    
                    // Sort tasks berdasarkan createdAt
                    validTasks.sort((a, b) => {
                        try {
                            const dateA = new Date(a.createdAt || 0).getTime();
                            const dateB = new Date(b.createdAt || 0).getTime();
                            return dateB - dateA;
                        } catch (e) {
                            return 0;
                        }
                    });
                    
                    // Cek tasks yang melewati deadline dan ubah statusnya
                    const checkedTasks = checkOverdueTasks(validTasks);
                    
                    set(checkedTasks);
                } catch (error) {
                    // Set empty array sebagai fallback
                    set([]);
                }
            }
        },
        addTask: (task: Task) => {
            if (!task?.id) {
                return;
            }
            
            try {
                const normalizedTask = normalizeTask(task);
                
                update(tasks => {
                    // Cek jika task sudah ada
                    const existingIndex = tasks.findIndex(t => t.id === normalizedTask.id);
                    
                    if (existingIndex >= 0) {
                        // Update task yang sudah ada
                        const updatedTasks = [...tasks];
                        updatedTasks[existingIndex] = normalizedTask;
                        return updatedTasks;
                    } else {
                        // Tambahkan task baru
                        return [normalizedTask, ...tasks];
                    }
                });
            } catch (error) {
                console.error('Error adding task to overview store:', error);
            }
        },
        updateTask: (id: string, data: Partial<Task>) => {
            if (!id) {
                return;
            }
            
            update(tasks => {
                const taskIndex = tasks.findIndex(t => t.id === id);
                
                if (taskIndex === -1) {
                    return tasks;
                }
                
                const updatedTasks = [...tasks];
                const oldTask = tasks[taskIndex];
                
                updatedTasks[taskIndex] = normalizeTask({
                    ...oldTask,
                    ...data,
                    updatedAt: new Date().toISOString()
                });
                
                return updatedTasks;
            });
        },
        removeTask: (id: string) => {
            if (!id) {
                return;
            }
            
            update(tasks => tasks.filter(t => t.id !== id));
        },
        deleteTasksByProject: (projectId: string) => {
            if (!projectId) {
                return;
            }
            
            update(tasks => tasks.filter(t => t.projectId !== projectId));
        },
        reset: () => {
            set([]);
        }
    };
}

export const tasksOverviewStore = createTasksOverviewStore();