import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({locals, params}) => {
    if (!locals.user) {
		throw redirect (302, '/')
	}
  const { ID } = params
    return {
        ID
    };
}) satisfies PageServerLoad;