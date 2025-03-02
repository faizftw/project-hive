import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/prisma';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	try {
		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const taskId = params.id;
		const data = await request.json();

		// Validasi data
		if (!data.title?.trim()) {
			return json({ error: 'Judul task tidak boleh kosong' }, { status: 400 });
		}

		// Cek kepemilikan task
		const existingTask = await prisma.task.findUnique({
			where: {
				id: taskId,
				createdById: locals.user.id
			},
			include: {
				project: true
			}
		});

		if (!existingTask) {
			return json({ error: 'Task tidak ditemukan' }, { status: 404 });
		}

		// Validasi deadline task tidak melebihi deadline project
		if (data.deadline && existingTask.project.dueDate) {
			const taskDeadline = new Date(data.deadline);
			const projectDeadline = new Date(existingTask.project.dueDate);

			if (taskDeadline > projectDeadline) {
				return json({ error: 'Deadline task tidak boleh melebihi deadline project' }, { status: 400 });
			}
		}

		// Persiapkan data label
		let labelConnect = undefined;
		if (data.label) {
			if (data.label.value === 'add-new' && data.newLabel) {
				const labelValue = data.newLabel.toLowerCase().replace(/\s+/g, '-');
				labelConnect = {
					create: {
						value: labelValue,
						label: data.newLabel
					}
				};
			} else {
				labelConnect = {
					connect: { value: data.label.value }
				};
			}
		}

		// Update task
		const updatedTask = await prisma.task.update({
			where: { id: taskId },
			data: {
				title: data.title.trim(),
				description: data.description?.trim() || null,
				priority: data.priority,
				status: data.status,
				deadline: data.deadline ? new Date(data.deadline) : null,
				label: labelConnect,
				url: data.url ? JSON.stringify(data.url) : null,
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
			}
		});

		return json({ task: updatedTask });
	} catch (error: any) {
		console.error('Error updating task:', error);
		return json({ 
			error: 'Terjadi kesalahan saat mengupdate task' 
		}, { status: 500 });
	}
}; 