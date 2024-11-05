export interface Project {
	id: string;
	name: string;
	description: string | null;
	status: 'active' | 'completed' | 'cancelled' | 'on-hold';
	dueDate: string | null;
	createdAt: string;
	createdById: string;
	createdBy: {
		id: string;
		name: string;
		email: string;
	};
}

export interface Task {
	id: string;
	title: string;
	status: string;
	label: string;
	priority: string;
}

export interface PageData {
	projects: Project[];
}

