import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  return {
    // Landing page metadata
    title: 'Project Hive - Project Management Solution',
    description: 'Your complete task and project management solution'
  };
};

export const ssr = true;
export const csr = true; 