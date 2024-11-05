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
        deleteProject: (projectId: string) => {
            update(projects => projects.filter(p => p.id !== projectId));
        },
        addProject: (project: Project) => {
            if (!project?.id || typeof project.id !== 'string' || !project?.name) {
                console.error('Invalid project data:', project);
                return;
            }
            update(projects => [project, ...projects]);
        },
        updateProject: (updatedProject: Project) => {
            if (!updatedProject?.id || !updatedProject?.name) {
                console.error('Invalid project data:', updatedProject);
                return;
            }
            
            update(projects => {
                const index = projects.findIndex(p => p.id === updatedProject.id);
                if (index === -1) {
                    console.warn('Project not found in store:', updatedProject.id);
                    return projects;
                }
                const newProjects = [...projects];
                newProjects[index] = updatedProject;
                return newProjects;
            });
        }
    };
}

export const projectsStore = createProjectStore();