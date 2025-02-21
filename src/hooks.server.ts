import { redirect, type Handle } from '@sveltejs/kit';
import { AUTH_ROUTES, DASHBOARD_ROUTE } from '@/lib/utils/navLinks';
import {
	deleteSessionTokenCookie,
	setSessionTokenCookie,
	validateSessionToken
} from './lib/server/authUtils';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session') ?? null;
	if (!token) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await validateSessionToken(token);
	if (!session) {
		deleteSessionTokenCookie(event.cookies);
	}

	if (session && AUTH_ROUTES.includes(event.url.pathname)) {
		setSessionTokenCookie(event, token, session.expiresAt);
		redirect(303, DASHBOARD_ROUTE);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};
