import { writable } from 'svelte/store';
import type { Project } from '$lib/types';

function createProjectStore() {
    const { subscribe, set, update } = writable<Project[]>([]);

    return {
        subscribe,
        set: (projects: Project[]) => {
            const validProjects = projects.filter(p => 
                p && 
                typeof p.id === 'string' && 
                typeof p.name === 'string'
            );
            set(validProjects);
        },
        addProject: (project: Project) => {
            if (!project?.id || typeof project.id !== 'string' || !project?.name) {
                console.error('Invalid project data:', project);
                return;
            }
            update(projects => {
                const filteredProjects = projects.filter(p => p.id !== project.id);
                return [project, ...filteredProjects];
            });
        },
        update
    };
}

export const projectsStore = createProjectStore();