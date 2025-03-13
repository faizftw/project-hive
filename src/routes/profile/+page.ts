import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
  return {
    user: data.user,
    
    // Data task
    tasksCount: data.tasksCount,
    completedTasksCount: data.completedTasksCount,
    inProgressTasksCount: data.inProgressTasksCount || 0,
    todoTasksCount: data.todoTasksCount || 0,
    backlogTasksCount: data.backlogTasksCount || 0,
    canceledTasksCount: data.canceledTasksCount || 0,
    pendingTasksCount: data.pendingTasksCount || 0,
    
    // Data project
    projectsCount: data.projectsCount,
    activeProjectsCount: data.activeProjectsCount,
    completedProjectsCount: data.completedProjectsCount || 0,
    cancelledProjectsCount: data.cancelledProjectsCount || 0, 
    onHoldProjectsCount: data.onHoldProjectsCount || 0,
    
    // Data aktivitas
    recentActivities: data.recentActivities
  };
}; 