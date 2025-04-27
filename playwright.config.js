/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	// Hapus webServer jika ingin testing di vercel
	// webServer: {
	//   command: 'npm run build && npm run preview',
	//   port: 4173
	// },
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
	  // Gunakan base URL vercel Anda
	  baseURL: 'https://project-hive-psi.vercel.app/',
	},
  };
  
  export default config;