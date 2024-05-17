import type { LayoutServerLoad } from './$types';
import { loadFlash } from 'sveltekit-flash-message/server';
import { createBaseMetaTags } from '@/lib/utils/metaTags';

export const load: LayoutServerLoad = loadFlash(async ({ url, locals: { session, user } }) => {
	const baseMetaTags = createBaseMetaTags(url);
	return {
		user,
		isUserLoggedIn: session !== null,
		baseMetaTags: Object.freeze(baseMetaTags)
	};
});
