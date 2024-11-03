import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	// Hapus cookie session menggunakan cookies helper
	cookies.delete('session', {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: process.env.NODE_ENV === 'production'
	});

	return new Response(JSON.stringify({ success: true }), {
		status: 200
	});
};
