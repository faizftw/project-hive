import type { RequestHandler } from './$types';
import { prisma } from '$lib/prisma';
import { json } from '@sveltejs/kit';
import { taskCreateSchema } from '../../task/(data)/schemas.js';
import { z } from 'zod';


export const GET: RequestHandler = async () => {
	try {
		const tasks = await prisma.task.findMany({
			include: {
				
				createdBy: {
					select: { id: true, name: true, email: true },
				},
				project: {
					select: { id: true, name: true, description: true },
				},
				label: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
		return json(tasks);
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return json({ error: 'Pengguna tidak terautentikasi.' }, { status: 401 });
		}

		const data = await request.json();

		// Debug: Tampilkan data yang diterima
		console.log('Data diterima dari frontend:', data);

		// Validasi data menggunakan taskCreateSchema
		const parsedData = taskCreateSchema.parse(data);

		const { title, description, priority, status, deadline, projectId, label } = parsedData;

		if (!title || !projectId) {
			return json({ error: 'Judul dan Project ID diperlukan.' }, { status: 400 });
		}

		const project = await prisma.project.findUnique({
			where: {
				id: projectId,
				createdById: locals.user.id,
			},
		});

		if (!project) {
			return json({ error: 'Project tidak ditemukan atau tidak dimiliki oleh pengguna.' }, { status: 404 });
		}

		let labelConnect = undefined;

		if (label) {
			if (typeof label === 'string') {
				const labelObj = await prisma.label.findUnique({ where: { value: label } });
				if (labelObj) {
					labelConnect = { connect: { value: label } };
				} else {
					// Jika label tidak ditemukan, tambahkan label baru
					const newLabel = await prisma.label.create({
						data: {
							value: label,
							label: label.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
						},
					});
					labelConnect = { connect: { value: newLabel.value } };
				}
			} else if (typeof label === 'object' && label.value) {
				const labelObj = await prisma.label.findUnique({ where: { value: label.value } });
				if (labelObj) {
					labelConnect = { connect: { value: label.value } };
				} else {
					// Jika label objek tidak ditemukan, buat label baru
					const newLabel = await prisma.label.create({
						data: {
							value: label.value,
							label: label.label,
						},
					});
					labelConnect = { connect: { value: newLabel.value } };
				}
			}
		}

		const newTask = await prisma.task.create({
			data: {
				title,
				description,
				priority,
				status,
				deadline: deadline ? new Date(deadline) : null,
				project: {
					connect: { id: projectId },
				},
				createdBy: {
					connect: { id: locals.user.id },
				},
				label: labelConnect,
			},
			include: {
				label: true,
				project: true,
				createdBy: true,
			},
		});

		console.log('Task berhasil dibuat:', newTask);

		return json({ task: newTask }, { status: 201 });
	} catch (error: any) {
		if (error instanceof z.ZodError) {
			console.error('ZodError:', error.errors);
			return json({ error: error.errors }, { status: 400 });
		}
		console.error('Error:', error.message);
		return json({ error: error.message }, { status: 500 });
	}
};
