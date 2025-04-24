import type { RequestHandler } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { prisma } from '$lib/prisma';
import { json } from '@sveltejs/kit';
import { serialize } from 'cookie';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, password, name } = await request.json();

		// Validasi input
		if (!email || !password || !name) {
			return json({ error: 'Email, password, dan name wajib diisi' }, { status: 400 });
		}

		// Validasi format email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return json({ error: 'Format email tidak valid' }, { status: 400 });
		}

		// Cek apakah pengguna sudah ada
		const existingUser = await prisma.user.findUnique({
			where: { email }
		});

		if (existingUser) {
			return json({ error: 'Email sudah terdaftar' }, { status: 409 });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Buat pengguna baru
		const user = await prisma.user.create({
			data: {
				email,
				name,
				password: hashedPassword
			},
			select: {
				id: true,
				email: true,
				name: true
			}
		});

		// Buat cookie sesi
		const sessionId = user.id; // Anda dapat menggunakan penyimpanan sesi yang lebih aman

		const headers = new Headers();
		headers.append(
			'Set-Cookie',
			serialize('session', sessionId, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 7 // 1 minggu
			})
		);

		return new Response(
			JSON.stringify({
				message: 'Signup berhasil',
				user: {
					id: user.id,
					email: user.email,
					name: user.name
				}
			}),
			{
				status: 201,
				headers
			}
		);
	} catch (error) {
		console.error('Signup error:', error);
		return json({ error: 'An error occurred during signup' }, { status: 500 });
	}
};
