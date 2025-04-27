import type { RequestHandler } from './$types';
import { prisma } from '$lib/prisma';
import { json } from '@sveltejs/kit';
import { taskCreateSchema } from '../../task/(data)/schemas.js';
import { z } from 'zod';


export const GET: RequestHandler = async ({ url }) => {
  try {
    // Dapatkan projectId dari query parameter jika ada
    const projectId = url.searchParams.get('projectId');

    // Buat where clause berdasarkan projectId jika ada
    const where = projectId ? { projectId } : {};

    const tasks = await prisma.task.findMany({
      where,
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

    // Normalisasi data task sebelum dikirim ke client
    const parsedTasks = tasks.map(task => {
      // Parse URL string menjadi objek jika ada
      let parsedUrl = null;
      if (task.url) {
        try {
          parsedUrl = typeof task.url === 'string' ? JSON.parse(task.url) : task.url;
        } catch (e) {
          console.error(`Error parsing URL for task ${task.id}:`, e);
          parsedUrl = { url: task.url, alias: null };
        }
      }

      // Pastikan semua field ada dan valid
      return {
        ...task,
        url: parsedUrl,
        // Pastikan label konsisten
        label: task.label || null,
        // Pastikan prioritas konsisten
        priority: task.priority || 'Low',
        // Pastikan status konsisten
        status: task.status || 'Pending',
      };
    });

    // Log untuk debugging
    console.log(`API: Returning ${parsedTasks.length} tasks for projectId: ${projectId || 'all'}`);
    
    return json(parsedTasks);
  } catch (error: any) {
    console.error('API Error fetching tasks:', error);
    return json({ error: error.message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const data = await request.json();

		// Validasi data menggunakan taskCreateSchema
		const parsedData = taskCreateSchema.parse(data);

		const { title, description, priority, status, deadline, projectId, label } = parsedData;

		if (!title || !projectId) {
			return json({ error: 'Title and Project ID are required' }, { status: 400 });
		}

		const project = await prisma.project.findUnique({
			where: {
				id: projectId,
				createdById: locals.user.id,
			},
		});

		if (!project) {
			return json({ error: 'Project not found or not owned by the user' }, { status: 404 });
		}

		// Validasi deadline task tidak melebihi deadline project
		if (deadline && project.dueDate) {
			const taskDeadline = new Date(deadline);
			const projectDeadline = new Date(project.dueDate);

			if (taskDeadline > projectDeadline) {
				return json({ error: 'Task deadline cannot exceed project deadline' }, { status: 400 });
			}
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
		
		// Persiapkan URL dengan benar
		let urlData = null;
		if (data.url) {
			urlData = JSON.stringify({
				url: data.url.url || data.url,
				alias: data.url.alias || null
			});
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
				url: urlData,
			},
			include: {
				label: true,
				project: true,
				createdBy: true,
			},
		});

		return json({ task: newTask }, { status: 201 });
	} catch (error: any) {
		if (error instanceof z.ZodError) {
			return json({ error: 'Invalid task data: ' + error.errors[0]?.message }, { status: 400 });
		}
		return json({ error: 'Failed to create task: ' + error.message }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			return json({ error: 'Pengguna tidak terautentikasi.' }, { status: 401 });
		}

		const data = await request.json();
		const { id } = data;
		
		console.log('Mencoba menghapus task dengan ID:', id);

		// Cek apakah task ada dan dimiliki oleh user
		const task = await prisma.task.findUnique({
			where: {
				id,
				createdById: locals.user.id
			},
			include: {
				project: {
					select: { id: true }
				}
			}
		});

		if (!task) {
			return json({ error: 'Task tidak ditemukan atau tidak dimiliki oleh pengguna.' }, { status: 404 });
		}
		
		const projectId = task.project?.id;

		// Hapus task
		await prisma.task.delete({
			where: { id }
		});
		
		console.log('Task deleted successfully');
		
		return json({ 
			message: 'Tugas berhasil dihapus',
			projectId 
		}, { status: 200 });

	} catch (error: any) {
		console.error('Error deleting task:', error);
		return json({ error: 'Failed to delete task: ' + error.message }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ request, locals, params }) => {
	try {
		if (!locals.user) {
			return json({ error: 'Pengguna tidak terautentikasi.' }, { status: 401 });
		}

		const data = await request.json();
		const { id } = data;

		// Cek apakah task ada dan dimiliki oleh user
		const existingTask = await prisma.task.findUnique({
			where: {
				id,
				createdById: locals.user.id
			}
		});

		if (!existingTask) {
			return json({ error: 'Task not found or not owned by the user.' }, { status: 404 });
		}

		let labelConnect = undefined;
		if (data.label) {
			if (typeof data.label === 'string') {
				labelConnect = { connect: { value: data.label } };
			} else {
				labelConnect = { connect: { value: data.label.value } };
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

		const updatedTask = await prisma.task.update({
			where: { id },
			data: {
				title: data.title,
				description: data.description,
				priority: data.priority,
				status: data.status,
				deadline: data.deadline ? new Date(data.deadline) : null,
				label: labelConnect,
				url: urlData,
			},
			include: {
				label: true,
				project: true,
				createdBy: true,
			},
		});

		return json({ task: updatedTask });
	} catch (error: any) {
		console.error('Error updating task:', error);
		return json({ error: error.message }, { status: 500 });
	}
};
