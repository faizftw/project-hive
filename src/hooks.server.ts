import type { Handle } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const session = event.cookies.get('session');
	const publicPaths = ['/auth/login', '/auth/signup'];
	const apiPaths = ['/api/auth/login', '/api/auth/logout', '/api/auth/signup'];
	const currentPath = event.url.pathname;

	event.locals.user = null;

	if (apiPaths.includes(currentPath)) {
		return await resolve(event);
	}

	if (session) {
		const user = await prisma.user.findUnique({
			where: { id: session }
		});

		if (user) {
			event.locals.user = {
				id: user.id,
				name: user.name,
				email: user.email
			};

			if (publicPaths.includes(currentPath)) {
				throw redirect(302, '/main');
			}
			
			if (currentPath === '/') {
				throw redirect(302, '/main');
			}
		} else {
			event.cookies.delete('session', { path: '/' });
			if (!publicPaths.includes(currentPath)) {
				throw redirect(302, '/auth/login');
			}
		}
	} else {
		if (!publicPaths.includes(currentPath)) {
			throw redirect(302, '/auth/login');
		}
	}

	return await resolve(event);
};
