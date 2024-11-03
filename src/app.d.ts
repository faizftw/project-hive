// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			user?: {
				id: string;
				name: string;
				email: string;
			} | null;
		}
		// interface PageState {}
		// interface Platform {}
		interface Locals {
			user: {
				id: string;
				name: string;
				email: string;
			} | null;
		}
	}
}

export {};
