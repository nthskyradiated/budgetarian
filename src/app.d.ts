// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}

		interface Locals {
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
			projects: import('@/db/schema/projectsSchema/projects').Projects;
		}
		interface PageData {
			pageMetaTags?: MetaTagsProps;
			isUserLoggedIn: boolean;
			flash?: { type: 'success' | 'error'; message: string };
			isDialogOpen?: boolean;
		}
	}
}

export {};
