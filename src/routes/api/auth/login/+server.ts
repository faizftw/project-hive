import type { RequestHandler } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { prisma } from '$lib/prisma';
import { json } from '@sveltejs/kit';
import { serialize } from 'cookie';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, password } = await request.json();

		// Validasi input
		if (!email || !password) {
			return json({ error: 'Email dan password wajib diisi' }, { status: 400 });
		}

		// Cari pengguna berdasarkan email
		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
				password: true,
				name: true
			}
		});

		if (!user) {
			return json({ error: 'Email atau password salah' }, { status: 401 });
		}

		// Verifikasi password
		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword) {
			return json({ error: 'Email atau password salah' }, { status: 401 });
		}

		// Buat cookie sesi
		const sessionId = user.id; // Gunakan user.id sebagai session

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
				message: 'Login berhasil',
				user: {
					id: user.id,
					email: user.email,
					name: user.name
				}
			}),
			{
				status: 200,
				headers
			}
		);
	} catch (error) {
		console.error('Login error:', error);
		return json({ error: 'An error occurred during login' }, { status: 500 });
	}
};
