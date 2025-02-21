import { invalidateSession, deleteSessionTokenCookie } from '@/lib/server/authUtils.js';
import { fail, redirect } from '@sveltejs/kit';

export const GET = async (event) => {
	if (!event.locals.session) {
		fail(401);
	}
	const session = event.locals.session;
	if (session) {
		invalidateSession(session.id);
		deleteSessionTokenCookie(event.cookies);
	}
	return redirect(302, '/');
};
