import { tasksStore } from '$lib/stores/tasks';
import { browser } from '$app/environment';

export async function refreshTableData(projectId?: string) {
  try {
    // Hanya jalankan fetch di client-side
    if (browser) {
      const url = projectId ? `/api/tasks?projectId=${projectId}` : '/api/tasks';
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const tasks = await response.json();
      tasksStore.set(tasks);
    }
  } catch (error) {
    console.error('Error refreshing data:', error);
    // Tidak throw error agar tidak menghentikan rendering
    return [];
  }
} 