import { prisma } from '$lib/prisma';
import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';

// Fungsi helper untuk menghitung status project berdasarkan tasks
function computeProjectStatus(tasks: any[], dueDate: Date | null) {
	const now = new Date();
	
	// Rule 1: Jika deadline terlewat & tidak ada progress
	if (dueDate) {
		if (now > dueDate) {
			const startedOrCompleted = tasks.filter(
				task => task.status === 'In Progress' || task.status === 'Completed'
			);
			if (startedOrCompleted.length === 0) {
				return "cancelled";
			}
		}
	}

	// Rule 2: Jika semua task completed
	if (tasks.length > 0 && tasks.every(task => task.status === 'Completed')) {
		return "completed";
	}

	// Rule 3: Jika tidak ada update selama 7 hari
	if (tasks.length > 0) {
		const latestTaskTime = Math.max(
			...tasks.map(task => new Date(task.createdAt).getTime())
		);
		if (now.getTime() - latestTaskTime > 7 * 24 * 60 * 60 * 1000) {
			return "on-hold";
		}
	}

	// Default: Active
	return "active";
}

export const load = (async ({ url, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	// Ambil semua proyek untuk user yang sedang login
	const projects = await prisma.project.findMany({
		where: {
			createdById: locals.user.id
		},
		include: {
			createdBy: {
				select: {
					id: true,
					name: true,
					email: true
				}
			}
		},
		orderBy: {
			createdAt: 'desc'
		}
	});

	// Ambil semua tugas untuk proyek-proyek tersebut
	const tasks = await prisma.task.findMany({
		where: {
			projectId: {
				in: projects.map(project => project.id)
			}
		},
		include: {
			label: true,
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	// Update status project berdasarkan tasks
	const updatedProjects = await Promise.all(projects.map(async (project) => {
		const projectTasks = tasks.filter(task => task.projectId === project.id);
		const computedStatus = computeProjectStatus(projectTasks, project.dueDate);
		
		if (computedStatus !== project.status) {
			// Update status di database
			const updatedProject = await prisma.project.update({
				where: { id: project.id },
				data: { status: computedStatus },
				include: {
					createdBy: {
						select: {
							id: true,
							name: true,
							email: true
						}
					}
				}
			});
			return updatedProject;
		}
		return project;
	}));

	return {
		projects: updatedProjects,
		tasks,
		tag: 'all'
	};
}) satisfies PageServerLoad;

async function deleteProject(projectId: string, userId: string) {
	try {
		// Hapus semua task terkait project terlebih dahulu
		await prisma.task.deleteMany({
			where: {
				projectId: projectId,
				createdById: userId
			}
		});

		// Kemudian hapus projectnya
		await prisma.project.delete({
			where: {
				id: projectId,
				createdById: userId
			}
		});

		return true;
	} catch (error) {
		console.error('Error menghapus project:', error);
		return false;
	}
}

export const actions = {
	createProject: async ({ request, locals }) => {
		if (!locals.user) {
			return { type: 'error', error: 'Unauthorized' };
		}

		try {
			const formData = await request.formData();
			const name = formData.get('name')?.toString();
			const description = formData.get('description')?.toString();
			const dueDate = formData.get('dueDate')?.toString();

			if (!name) {
				return { type: 'error', error: 'Nama project harus diisi' };
			}

			const project = await prisma.project.create({
				data: {
					name,
					description: description || null,
					dueDate: dueDate ? new Date(dueDate) : null,
					createdById: locals.user.id,
					status: 'active'
				},
				include: {
					createdBy: {
						select: {
							id: true,
							name: true,
							email: true
						}
					}
				}
			});

			// Return data dalam format yang lebih sederhana
			return {
				type: 'success',
				status: 200,
				data: {
					id: project.id,
					name: project.name,
					description: project.description,
					status: project.status,
					dueDate: project.dueDate?.toISOString() || null,
					createdAt: project.createdAt.toISOString(),
					createdById: project.createdById,
					createdBy: {
						id: project.createdBy.id,
						name: project.createdBy.name,
						email: project.createdBy.email
					}
				}
			};

		} catch (error) {
			console.error('Server error creating project:', error);
			return { type: 'error', error: 'Gagal membuat project' };
		}
	},


	deleteProject: async ({ request, locals }) => {
		if (!locals.user) {
			return { type: 'error', error: 'Unauthorized' };
		}

		try {
			const formData = await request.formData();
			const projectId = formData.get('id')?.toString();

			if (!projectId) {
				return { type: 'error', error: 'Project ID tidak valid' };
			}

			const success = await deleteProject(projectId, locals.user.id);

			if (!success) {
				return { type: 'error', error: 'Gagal menghapus project' };
			}

			return {
				type: 'success',
				status: 200,
				message: 'Project berhasil dihapus'
			};

		} catch (error) {
			console.error('Server error deleting project:', error);
			return { 
				type: 'error', 
				error: error instanceof Error ? error.message : 'Failed to delete project'
			};
		}
	},

	updateProject: async ({ request, locals }) => {
		if (!locals.user) {
			return { type: 'error', error: 'Unauthorized' };
		}

		try {
			const formData = await request.formData();
			const projectId = formData.get('id')?.toString();
			const name = formData.get('name')?.toString();
			const description = formData.get('description')?.toString();
			const status = formData.get('status')?.toString();
			const dueDate = formData.get('dueDate')?.toString();

			if (!projectId || !name) {
				return { type: 'error', error: 'Data project tidak lengkap' };
			}

			// Validasi kepemilikan project
			const existingProject = await prisma.project.findUnique({
				where: { 
					id: projectId,
					createdById: locals.user.id 
				}
			});

			if (!existingProject) {
				return { type: 'error', error: 'Project tidak ditemukan' };
			}

			// Update project
			const updatedProject = await prisma.project.update({
				where: { id: projectId },
				data: {
					name,
					description: description || null,
					status: status as 'active' | 'completed',
					dueDate: dueDate ? new Date(dueDate) : null
				},
				include: {
					createdBy: {
						select: {
							id: true,
							name: true,
							email: true
						}
					}
				}
			});

			return {
				type: 'success',
				data: {
					id: updatedProject.id,
					name: updatedProject.name,
					description: updatedProject.description,
					status: updatedProject.status,
					dueDate: updatedProject.dueDate?.toISOString() || null,
					createdAt: updatedProject.createdAt.toISOString(),
					createdById: updatedProject.createdById,
					createdBy: {
						id: updatedProject.createdBy.id,
						name: updatedProject.createdBy.name,
						email: updatedProject.createdBy.email
					}
				}
			};

		} catch (error) {
			console.error('Server error updating project:', error);
			return { type: 'error', error: 'Gagal mengupdate project' };
		}
	}
} satisfies Actions;
