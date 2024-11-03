import { prisma } from '$lib/prisma';

export async function createProject(name: string, description: string) {
	const project = await prisma.project.create({
		data: {
			name,
			description,
			createdById: 'user-id' // Ganti dengan ID pengguna yang sedang login
		}
	});
	return project;
}
