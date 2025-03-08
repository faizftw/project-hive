import { prisma } from '$lib/prisma';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Pastikan pengguna sudah login
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  try {
    // Ambil data user dari database
    const user = await prisma.user.findUnique({
      where: { id: locals.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    if (!user) {
      throw error(404, 'User not found');
    }

    // Hitung jumlah task yang dimiliki pengguna
    const tasksCount = await prisma.task.count({
      where: { createdById: locals.user.id }
    });

    // Hitung jumlah project yang dimiliki pengguna
    const projectsCount = await prisma.project.count({
      where: { createdById: locals.user.id }
    });

    // Ambil aktivitas terbaru (tasks dan projects)
    const recentTasks = await prisma.task.findMany({
      where: { createdById: locals.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true
      }
    });

    const recentProjects = await prisma.project.findMany({
      where: { createdById: locals.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true
      }
    });

    // Format data untuk dikirim ke client
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        joinDate: user.createdAt.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      },
      tasksCount,
      projectsCount,
      recentActivities: [
        ...recentTasks.map(task => ({
          id: task.id,
          type: 'task',
          title: task.title,
          status: task.status,
          timestamp: task.createdAt.toISOString()
        })),
        ...recentProjects.map(project => ({
          id: project.id,
          type: 'project',
          title: project.name,
          status: project.status,
          timestamp: project.createdAt.toISOString()
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
    };
  } catch (err) {
    console.error('Error loading profile data:', err);
    throw error(500, 'Failed to load profile data');
  }
}; 