import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Menggunakan adapter-vercel dengan konfigurasi runtime
		adapter: adapter({
			runtime: 'nodejs20.x'
		}),
		alias: {
			'@/*': './src/lib/*'
		}
	},
	preprocess: vitePreprocess()
};

export default config;
