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
			return json({ error: 'Title cannot be empty' }, { status: 400 });
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
			return json({ error: 'Task not found' }, { status: 404 });
		}

		// Validasi deadline task tidak melebihi deadline project
		if (data.deadline && existingTask.project.dueDate) {
			const taskDeadline = new Date(data.deadline);
			const projectDeadline = new Date(existingTask.project.dueDate);

			if (taskDeadline > projectDeadline) {
				return json({ error: 'Tugas tidak dapat melebihi deadline proyek' }, { status: 400 });
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
		
		// Persiapkan URL dengan benar
		let urlData = null;
		if (data.url) {
			if (typeof data.url === 'string') {
				try {
					// Jika URL sudah berupa string JSON, gunakan langsung
					JSON.parse(data.url);
					urlData = data.url;
				} catch {
					// Jika bukan JSON valid, buat objek JSON baru
					urlData = JSON.stringify({
						url: data.url,
						alias: null
					});
				}
			} else {
				// Jika URL berupa objek
				urlData = JSON.stringify({
					url: data.url.url,
					alias: data.url.alias || null
				});
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
				url: urlData,
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
			error: 'An error occurred while updating the task' 
		}, { status: 500 });
	}
}; 