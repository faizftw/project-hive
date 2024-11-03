import type { RequestHandler } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { prisma } from '$lib/prisma';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, password, name } = await request.json();

		// Validasi input
		if (!email || !password || !name) {
			return json({ error: 'All fields are required' }, { status: 400 });
		}

		// Cek apakah email sudah digunakan
		const existingUser = await prisma.user.findUnique({
			where: { email }
		});

		if (existingUser) {
			return json({ error: 'Email already registered' }, { status: 400 });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Simpan user ke database
		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				name
			}
		});

		return json({ message: 'User created successfully', userId: user.id }, { status: 201 });
	} catch (error) {
		console.error('Signup error:', error);
		return json({ error: 'An error occurred during signup' }, { status: 500 });
	}
};
