import { github, github_oauth_state_cookieName } from '@/lib/server/OAuthUtils';
import { lucia } from '@/lib/server/luciaUtils';
import { OAuth2RequestError } from 'arctic';
import { type RequestEvent } from '@sveltejs/kit';
import { db } from '@/db';
import { oAuthTable, usersTable } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { generateIdFromEntropySize } from 'lucia';
import { route } from '@/lib/router';
import { createAndSetSession } from '@/lib/server/authUtils';
import type { GitHubUser, GitHubEmail } from '@/lib/types';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');

	const storedState = event.cookies.get(github_oauth_state_cookieName) ?? null;
	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		const tokens = await github.validateAuthorizationCode(code);
		const githubUserResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});

		const githubEmailResponse = await fetch('https://api.github.com/user/emails', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});

		const githubUser: GitHubUser = await githubUserResponse.json();
		const githubEmail: GitHubEmail[] = await githubEmailResponse.json();

		const primaryEmail = githubEmail.find((email) => email.primary) ?? null;

		if (!primaryEmail) {
			return new Response('No primary email address', {
				status: 400
			});
		}

		if (!primaryEmail.verified) {
			return new Response('Unverified email', {
				status: 400
			});
		}

		// Check if the user already exists
		const [existingUser] = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.email, primaryEmail.email));

		if (existingUser) {
			// Check if the user already has a GitHub OAuth account linked
			const [existingOauthAccount] = await db
				.select()
				.from(oAuthTable)
				.where(
					and(
						eq(oAuthTable.provider, 'github'),
						eq(oAuthTable.providerUserId, githubUser.id.toString())
					)
				);
			if (!existingOauthAccount) {
				// Add the 'github' auth provider to the user's authMethods list
				const authMethods = existingUser.authMethods || [];
				authMethods.push('github');
				await db.transaction(async (trx) => {
					// Link the GitHub OAuth account to the existing user
					await trx.insert(oAuthTable).values({
						userId: existingUser.id,
						provider: 'github',
						providerUserId: githubUser.id.toString()
					});
					// Update the user's authMethods list
					await trx
						.update(usersTable)
						.set({
							authMethods,
							avatarUrl: githubUser.avatar_url
						})
						.where(eq(usersTable.id, existingUser.id));
				});
			}

			await createAndSetSession(lucia, existingUser.id, event.cookies);
		} else {
			const userId = generateIdFromEntropySize(10);
			console.log(githubUser);
			await db.transaction(async (trx) => {
				await trx.insert(usersTable).values({
					id: userId,
					name: githubUser.name ?? githubUser.login,
					username: githubUser.login,
					avatarUrl: githubUser.avatar_url,
					email: primaryEmail.email,
					isEmailVerified: true,
					authMethods: ['github']
				});
				await trx.insert(oAuthTable).values({
					userId,
					provider: 'github',
					providerUserId: githubUser.id.toString()
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
	} catch (e) {
		// the specific error message depends on the provider
		if (e instanceof OAuth2RequestError) {
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
