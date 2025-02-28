import { prisma } from '$lib/prisma';
import type { PageServerLoad } from './$types';
import { redirect, fail } from '@sveltejs/kit';

export const load = (async ({ url, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const projectId = url.searchParams.get('projectId');

	if (!projectId) {
		return fail(400, { message: 'Project ID diperlukan.' });
	}

	// Verifikasi apakah project dimiliki oleh user
	const project = await prisma.project.findUnique({
		where: {
			id: projectId,
			createdById: locals.user.id,
		},
	});

	if (!project) {
		return fail(404, { message: 'Project tidak ditemukan.' });
	}

	// Ambil tasks yang terkait dengan project tersebut
	const tasks = await prisma.task.findMany({
		where: {
			projectId: projectId,
		},
		include: {
			label: true,
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	return {
		tasks,
		project,
	};
}) satisfies PageServerLoad;