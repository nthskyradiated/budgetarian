import { redirect, type RequestEvent } from '@sveltejs/kit';
import { generateCodeVerifier, generateState } from 'arctic';
import {
	google,
	google_oauth_state_cookieName,
	google_oauth_code_verifier_cookieName
} from '@/lib/server/OAuthUtils';

export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();

	const url = await google.createAuthorizationURL(state, codeVerifier, {
		scopes: ['profile', 'email']
	});

	event.cookies.set(google_oauth_state_cookieName, state, {
		path: '/', // The cookie will be accessible on all paths
		secure: import.meta.env.PROD, // The cookie will be sent over HTTPS if in production
		httpOnly: true, // The cookie cannot be accessed through client-side script
		maxAge: 60 * 10, // The cookie will expire after 10 minutes
		sameSite: 'lax' // The cookie will only be sent with same-site requests or top-level navigations
	});
	event.cookies.set(google_oauth_code_verifier_cookieName, codeVerifier, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	return redirect(302, url);
}
