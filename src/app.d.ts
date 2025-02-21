// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { User } from '$lib/server/user';
import type { Session } from '$lib/server/session';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}

		interface Locals {
			user: User | null;
			session: Session | null;
		}
		interface PageData {
			pageMetaTags?: MetaTagsProps;
			isUserLoggedIn: boolean;
			flash?: { type: 'success' | 'error'; message: string };
		}
	}
}

export {};
