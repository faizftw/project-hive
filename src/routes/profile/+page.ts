import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
  return {
    user: data.user,
    tasksCount: data.tasksCount,
    projectsCount: data.projectsCount,
    recentActivities: data.recentActivities
  };
}; 