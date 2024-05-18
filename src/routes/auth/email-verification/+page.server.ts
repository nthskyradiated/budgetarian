import { fail, redirect, type Actions, type Cookies } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms/server';
import {
	generateEmailVerificationCode,
	pendingUserVerification,
	sendEmailVerificationCode,
	verifyEmailVerificationCode
} from '@/lib/server/emailAuthUtils';
import type { PendingVerificationUserDataType } from '@/lib/types';
import { route } from '@/lib/router';
import { EmailVerificationCodeZodSchema } from '@/lib/zodValidators/zodAuthValidation';
import { zod } from 'sveltekit-superforms/adapters';
import { sendCodeRateLimiter, verifyCodeRateLimiter } from '@/lib/server/rateLimiterUtils';
import db from '@/db';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { lucia } from '@/lib/server/luciaUtils';
import { createAndSetSession } from '@/lib/server/authUtils';
import { DASHBOARD_ROUTE } from '@/lib/utils/navLinks';

// Function to parse user data from cookie
const getUserDataFromCookie = (cookies: Cookies) => {
	const cookieData = cookies.get(pendingUserVerification);

	if (!cookieData) return null;

	return JSON.parse(cookieData) as PendingVerificationUserDataType;
};

export const load: PageServerLoad = async (event) => {
	await verifyCodeRateLimiter.cookieLimiter?.preflight(event);
	await sendCodeRateLimiter.cookieLimiter?.preflight(event);

	// Parse the user data from the cookie
	const userData = getUserDataFromCookie(event.cookies);

	if (!userData) {
		return redirect(303, route('/auth/register'));
	}

	return {
		pendingUserEmail: userData.email,
		emailVerificationCodeFormData: await superValidate(zod(EmailVerificationCodeZodSchema))
	};
};

export const actions: Actions = {
	verifyCode: async (event) => {
		const { cookies, request } = event;
		const userData = getUserDataFromCookie(cookies);
		if (!userData) return redirect(303, route('/auth/register'));

		const emailVerificationCodeFormData = await superValidate(
			request,
			zod(EmailVerificationCodeZodSchema)
		);

		if (emailVerificationCodeFormData.valid === false) {
			return message(emailVerificationCodeFormData, {
				alertType: 'error',
				alertText: 'Invalid verification code, please try again'
			});
		}
		const sendNewCodeRateLimiterResult = await verifyCodeRateLimiter.check(event);
		if (sendNewCodeRateLimiterResult.limited) {
			return message(
				emailVerificationCodeFormData,
				{
					alertType: 'error',
					alertText: `You have made too many requests and exceeded the rate limit. Please try again after ${sendNewCodeRateLimiterResult.retryAfter} seconds.`
				},
				{
					status: 429
				}
			);
		}
		const isVerificationCodeValid = await verifyEmailVerificationCode(
			userData.id,
			emailVerificationCodeFormData.data.verificationCode
		);
		if (isVerificationCodeValid.success === false) {
			return message(emailVerificationCodeFormData, {
				alertType: 'error',
				alertText: isVerificationCodeValid.message
			});
		}
		await db.transaction(async (trx) => {
			const [existingUser] = await trx
				.select()
				.from(usersTable)
				.where(eq(usersTable.email, userData.email));

			const authMethods = existingUser?.authMethods ?? [];
			authMethods.push('email');

			await trx
				.update(usersTable)
				.set({ isEmailVerified: true, authMethods })
				.where(eq(usersTable.email, userData.email));
		});
		await createAndSetSession(lucia, userData.id, cookies);

		cookies.set(pendingUserVerification, '', {
			maxAge: 0,
			path: route('/auth/email-verification')
		});

		redirect(303, DASHBOARD_ROUTE);
	},

	sendNewCode: async (event) => {
		const sendNewCodeRateLimiterResult = await sendCodeRateLimiter.check(event);

		if (sendNewCodeRateLimiterResult.limited) {
			return fail(429, {
				message: `You have made too many requests and exceeded the rate limit. Please try again after ${sendNewCodeRateLimiterResult.retryAfter} seconds.`
			});
		}

		const userData = getUserDataFromCookie(event.cookies);

		if (!userData) return redirect(303, route('/auth/register'));

		const emailVerificationCode = await generateEmailVerificationCode(userData.id, userData.email);

		const sendEmailVerificationCodeResult = await sendEmailVerificationCode(
			userData.email,
			emailVerificationCode
		);

		if (!sendEmailVerificationCodeResult.success) {
			return fail(500, {
				message: sendEmailVerificationCodeResult.message
			});
		}

		return {
			message: 'A new verification code has been sent to your email'
		};
	}
};
