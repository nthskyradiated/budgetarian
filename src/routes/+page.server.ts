import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createPageMetaTags } from '$lib/utils/metaTags';

export const load = (async ({ locals }) => {
	const pageMetaTags = createPageMetaTags({
		title: 'Budgetarian',
		description: 'Your budget visualized!'
	});
	if (locals.user) {
		redirect(302, '/protected/dashboard');
	}
	return {
		pageMetaTags: Object.freeze(pageMetaTags)
	};
}) satisfies PageServerLoad;
