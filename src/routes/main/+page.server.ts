import { prisma } from '$lib/prisma';
import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';

// Fungsi helper untuk menghitung status project berdasarkan tasks
function computeProjectStatus(tasks: any[], dueDate: Date | null): 'active' | 'completed' | 'cancelled' | 'on-hold' {
	const now = new Date();
	
	// Rule 1: Jika deadline terlewat & tidak ada progress
	if (dueDate && now > new Date(dueDate)) {
		const hasProgress = tasks.some(task => 
			task.status === 'In Progress' || task.status === 'Completed'
		);
		if (!hasProgress) return "cancelled";
	}

	// Rule 2: Jika semua task completed
	if (tasks.length > 0 && tasks.every(task => task.status === 'Completed')) {
		return "completed";
	}

	// Rule 3: Jika tidak ada update selama 7 hari
	if (tasks.length > 0) {
		const latestUpdate = Math.max(
			...tasks.map(task => new Date(task.createdAt).getTime())
		);
		const oneWeek = 7 * 24 * 60 * 60 * 1000;
		if (now.getTime() - latestUpdate > oneWeek) {
			return "on-hold";
		}
	}

	// Default status
	return "active";
}

export const load = (async ({ locals }) => {
	// Cek autentikasi
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	try {
		// Ambil semua proyek dan tasks secara parallel untuk optimasi
		const [projects, tasks] = await Promise.all([
			prisma.project.findMany({
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
			}),
			prisma.task.findMany({
				where: {
					createdById: locals.user.id
				},
				include: {
					label: true,
					project: true,
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
			})
		]);

		// Parse URL string menjadi objek untuk setiap task
		const parsedTasks = tasks.map(task => ({
			...task,
			url: task.url ? JSON.parse(task.url) : null
		}));

		// Hitung dan update status untuk setiap project
		const updatedProjects = await Promise.all(
			projects.map(async (project) => {
				const projectTasks = parsedTasks.filter(task => task.projectId === project.id);
				const newStatus = computeProjectStatus(projectTasks, project.dueDate);

				if (newStatus !== project.status) {
					return prisma.project.update({
						where: { id: project.id },
						data: { status: newStatus },
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
				}
				return project;
			})
		);

		return {
			projects: updatedProjects,
			tasks: parsedTasks,
			tag: 'all'
		};

	} catch (error) {
		console.error('Error loading data:', error);
		return {
			projects: [],
			tasks: [],
			tag: 'all',
			error: 'Gagal memuat data'
		};
	}
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
