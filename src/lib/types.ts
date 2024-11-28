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

export interface Label {
	id?: string;
	value: string;
	label: string;
}

export interface Task {
	id: string;
	title: string;
	description: string | null;
	priority: 'Low' | 'Medium' | 'High';
	status: 'Backlog' | 'Pending' | 'Todo' | 'In Progress' | 'Completed' | 'Canceled';
	label?: Label | string | null;
	deadline: string | null;
	createdAt: string;
	projectId: string;
	createdById: string;
}

export interface PageData {
	projects: Project[];
	tasks: Task[];
}

