import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createPageMetaTags } from '$lib/utils/metaTags';

export const load = (async ({ locals }) => {
	const pageMetaTags = createPageMetaTags({
		title: 'Home page',
		description: 'Home page description'
	});
	if (locals.user) {
		redirect(302, '/protected/dashboard');
	}
	return {
		pageMetaTags: Object.freeze(pageMetaTags)
	};
}) satisfies PageServerLoad;
