import { type RequestEvent } from '@sveltejs/kit';
import { OAuth2RequestError } from 'arctic';
import { and, eq } from 'drizzle-orm';
import { route } from '@/lib/router';
import { db } from '@/db';
import { oAuthTable, usersTable } from '@/db/schema';
import { createAndSetSession } from '@/lib/server/authUtils';
import {
	google,
	google_oauth_code_verifier_cookieName,
	google_oauth_state_cookieName
} from '@/lib/server/OAuthUtils';
import type { GoogleUser } from '@/lib/types';
import { generateIdFromEntropySize } from 'lucia';
import { lucia } from '@/lib/server/luciaUtils';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');

	const storedState = event.cookies.get(google_oauth_state_cookieName);
	const storedCodeVerifier = event.cookies.get(google_oauth_code_verifier_cookieName);

	// Validate OAuth state and code verifier
	if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
		return new Response('Invalid OAuth state or code verifier', {
			status: 400
		});
	}

	try {
		const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
		const googleUserResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		const googleUser: GoogleUser = await googleUserResponse.json();
		if (!googleUser.email) {
			return new Response('No primary email address', {
				status: 400
			});
		}

		if (!googleUser.email_verified) {
			return new Response('Unverified email', {
				status: 400
			});
		}

		const [existingUser] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.email, googleUser.email));

		if (existingUser) {
			const [existingOauthAccount] = await db
				.select()
				.from(oAuthTable)
				.where(
					and(eq(oAuthTable.provider, 'google'), eq(oAuthTable.providerUserId, googleUser.sub))
				);
			if (!existingOauthAccount) {
				const authMethods = existingUser.authMethods || [];
				authMethods.push('google');

				await db.transaction(async (trx) => {
					await trx.insert(oAuthTable).values({
						userId: existingUser.id,
						provider: 'google',
						providerUserId: googleUser.sub
					});
					await trx
						.update(usersTable)
						.set({
							authMethods,
							avatarUrl: googleUser.picture
						})
						.where(eq(usersTable.id, existingUser.id));
				});
			}
			await createAndSetSession(lucia, existingUser.id, event.cookies);
		} else {
			const userId = generateIdFromEntropySize(10);

			await db.transaction(async (trx) => {
				await trx.insert(usersTable).values({
					id: userId,
					name: googleUser.name,
					username: googleUser.sub,
					avatarUrl: googleUser.picture,
					email: googleUser.email,
					isEmailVerified: true,
					authMethods: ['google']
				});
				await trx.insert(oAuthTable).values({
					userId,
					provider: 'google',
					providerUserId: googleUser.sub
				});
			});
			await createAndSetSession(lucia, userId, event.cookies);
		}

		return new Response(null, {
			status: 302,
			headers: {
				Location: route('/protected/dashboard')
			}
		});
	} catch (error) {
		console.error(error);

		// the specific error message depends on the provider
		if (error instanceof OAuth2RequestError) {
			// invalid code
			return new Response(null, {
				status: 400
			});
		}

		return new Response(null, {
			status: 500
		});
	}
}
