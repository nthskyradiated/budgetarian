import { redirect as flashMessageRedirect } from 'sveltekit-flash-message/server';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { Argon2id } from 'oslo/password';
import { message, setError, superValidate } from 'sveltekit-superforms/server';
import { route } from '$lib/router';
import type { AlertMessageType } from '$lib/types';
import {
	checkIfCurrUserExists,
	createAndSetSession,
	createPasswordResetToken
} from '@/lib/server/authUtils';
import { passwordResetEmailRateLimiter } from '@/lib/server/rateLimiterUtils';
import { sendPasswordResetEmail } from '@/lib/server/emailAuthUtils';
import {
	UserLoginZodSchema,
	PasswordResetEmailZodSchema
} from '@/lib/zodValidators/zodAuthValidation';
import type {
	passwordResetEmailZodSchema,
	userLoginZodSchema
} from '@/lib/zodValidators/zodAuthValidation';
import { lucia } from '@/lib/server/luciaUtils';
import { zod } from 'sveltekit-superforms/adapters';
import { DASHBOARD_ROUTE } from '@/lib/utils/navLinks';

const NO_REGISTERED_ACCOUNT_ERROR_MESSAGE =
	"No account registered with this email. Please ensure you've entered the correct email.";

export const load = (async (event) => {
	if (event.locals.user) {
		redirect(302, 'protected/dashboard');
	}

	await passwordResetEmailRateLimiter.cookieLimiter?.preflight(event);

	return {
		userLoginFormData: await superValidate(zod(UserLoginZodSchema)),
		passwordResetEmailFormData: await superValidate(zod(PasswordResetEmailZodSchema))
	};
}) satisfies PageServerLoad;
export const actions: Actions = {
	logIn: async ({ request, cookies }) => {
		const userLoginFormData = await superValidate<userLoginZodSchema, AlertMessageType>(
			request,
			zod(UserLoginZodSchema)
		);

		if (userLoginFormData.valid === false) {
			return message(userLoginFormData, {
				alertType: 'error',
				alertText: 'There was a problem with your submission.'
			});
		}

		const existingUser = await checkIfCurrUserExists(userLoginFormData.data.email);

		if (!existingUser) {
			return setError(userLoginFormData, 'email', NO_REGISTERED_ACCOUNT_ERROR_MESSAGE);
		}

		let isPasswordValid = false;

		// If the user has a password, it means they registered with email
		if (existingUser.authMethods.includes('email') && existingUser.password) {
			isPasswordValid = await new Argon2id().verify(
				existingUser.password,
				userLoginFormData.data.password
			);
		} else {
			// If the user doesn't have a password, it means they registered with OAuth
			return message(
				userLoginFormData,
				{
					alertType: 'error',
					alertText:
						'You registered with an OAuth provider. Please use the appropriate login method.'
				},
				{
					status: 403 // This status code indicates that the server understood the request, but it refuses to authorize it because the user registered with OAuth
				}
			);
		}

		if (!isPasswordValid) {
			return setError(userLoginFormData, 'password', 'Incorrect password');
		}

		if (!existingUser.isEmailVerified) {
			throw flashMessageRedirect(
				route('/auth/email-verification'),
				{
					type: 'error',
					message: 'You must verify your email before logging in.'
				},
				cookies
			);
		}

		await createAndSetSession(lucia, existingUser.id, cookies);

		redirect(303, DASHBOARD_ROUTE);
	},

	sendPasswordResetEmail: async (event) => {
		const passwordResetEmailFormData = await superValidate<
			passwordResetEmailZodSchema,
			AlertMessageType
		>(event.request, zod(PasswordResetEmailZodSchema));

		try {
			if (passwordResetEmailFormData.valid === false) {
				return message(passwordResetEmailFormData, {
					alertType: 'error',
					alertText: 'There was a problem with your submission.'
				});
			}

			const passwordResetRateLimiterResult = await passwordResetEmailRateLimiter.check(event);

			if (passwordResetRateLimiterResult.limited) {
				return message(
					passwordResetEmailFormData,
					{
						alertType: 'error',
						alertText: `You have made too many requests and exceeded the rate limit. Please try again after ${passwordResetRateLimiterResult.retryAfter} seconds.`
					},
					{
						status: 429 // user made to many request and triggered rate limit
					}
				);
			}

			const existingUser = await checkIfCurrUserExists(passwordResetEmailFormData.data.email);

			if (!existingUser) {
				return setError(passwordResetEmailFormData, 'email', NO_REGISTERED_ACCOUNT_ERROR_MESSAGE);
			}

			if (!existingUser.isEmailVerified) {
				return message(
					passwordResetEmailFormData,
					{
						alertType: 'error',
						alertText: 'You must verify your email before resetting your password.'
					},

					{
						status: 403 // This status code indicates that the server understood the request, but it refuses to authorize it because the user's email is not verified.
					}
				);
			}

			const resetToken = await createPasswordResetToken(existingUser.id);

			const sendPasswordResetEmailResult = await sendPasswordResetEmail(
				existingUser.email,
				resetToken
			);

			if (!sendPasswordResetEmailResult.success) {
				return message(
					passwordResetEmailFormData,
					{
						alertType: 'error',
						alertText: sendPasswordResetEmailResult.message
					},

					{
						status: 500 // Internal Server Error
					}
				);
			}

			return message(passwordResetEmailFormData, {
				alertType: 'success',
				alertText: sendPasswordResetEmailResult.message
			});
		} catch (error) {
			console.error(error);

			return message(passwordResetEmailFormData, {
				alertType: 'error',
				alertText: 'An error occurred while processing your request. Please try again.'
			});
		}
	}
};
