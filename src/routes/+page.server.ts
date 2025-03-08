import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Halaman ini dapat diakses tanpa login (aturan dikontrol oleh hooks.server.ts)
	return {
		// Tidak perlu data khusus untuk landing page
	};
}; 