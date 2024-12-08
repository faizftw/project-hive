export async function refreshTableData(projectId: string) {
  try {
    const response = await fetch(`/api/tasks?projectId=${projectId}`);
    if (!response.ok) {
      throw new Error('Gagal mengambil data terbaru');
    }
    const tasks = await response.json();
    return tasks;
  } catch (error) {
    console.error('Error refreshing data:', error);
    throw error;
  }
} 