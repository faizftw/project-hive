import { prisma } from '$lib/prisma';
import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
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

	return {
		projects,
		tag: 'all'
	};
}) satisfies PageServerLoad;

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
	}
} satisfies Actions;
