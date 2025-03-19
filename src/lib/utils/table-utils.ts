import { tasksStore } from '$lib/stores/tasks';
import { browser } from '$app/environment';
import { toast } from 'svelte-sonner';

export async function refreshTableData(projectId?: string) {
  try {
    // Hanya jalankan fetch di client-side
    if (browser) {
      // Tambahkan timestamp untuk menghindari cache
      const timestamp = new Date().getTime();
      const url = projectId ? 
        `/api/tasks?projectId=${projectId}&_ts=${timestamp}` : 
        `/api/tasks?_ts=${timestamp}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const tasks = await response.json();
      
      // Reset store dahulu untuk menghindari duplikasi
      tasksStore.reset();
      
      // Setelah reset, update dengan data baru
      setTimeout(() => {
        tasksStore.set(tasks);
      }, 0);
      
      return tasks;
    }
  } catch (error: any) {
    console.error('Error refreshing data:', error);
    
    // Tampilkan notifikasi error
    if (browser) {
      toast.error(`Failed to refresh data: ${error.message || 'Try again later'}`);
    }
    
    // Tidak throw error agar tidak menghentikan rendering
    return [];
  }
} 