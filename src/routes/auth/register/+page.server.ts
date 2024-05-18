import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms/server';
import { generateIdFromEntropySize } from 'lucia';
import { zod } from 'sveltekit-superforms/adapters';
import { db } from '@/db/index';
import { usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm/expressions';
import { Argon2id } from 'oslo/password';
import { RegisterUserZodSchema } from '@/lib/zodValidators/zodAuthValidation';
import { checkIfUserExists, insertNewUser } from '@/lib/server/authUtils';
import {
	sendEmailVerificationCode,
	generateEmailVerificationCode,
	pendingUserVerification
} from '@/lib/server/emailAuthUtils';
import { logError } from '@/lib';
import { route } from '@/lib/router';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, 'protected/dashboard');
	}

	return {
		registerUserFormData: await superValidate(zod(RegisterUserZodSchema))
	};
};

export const actions: Actions = {
	register: async ({ cookies, request }) => {
		const registerUserFormData = await superValidate(request, zod(RegisterUserZodSchema));

		if (registerUserFormData.valid === false) {
			return message(registerUserFormData, {
				alertType: 'error',
				alertText: 'Please check your entries, the form contains invalid data'
			});
		}

		try {
			const { email, username } = registerUserFormData.data;
			const existingUser = await checkIfUserExists(email, username);

			if (existingUser?.username === username) {
				console.log('username exists!', existingUser.username);
				return message(registerUserFormData, {
					alertType: 'error',
					alertText: 'This username is already in use. Please use a different username.'
				});
			}
			if (existingUser?.authMethods.includes('email')) {
				console.log('email exists!', existingUser.email);
				return message(registerUserFormData, {
					alertType: 'error',
					alertText: 'This email is already in use. Please use a different email address.'
				});
			}
			const userId = existingUser?.id ?? generateIdFromEntropySize(10);
			const hashedPassword = await new Argon2id().hash(registerUserFormData.data.password);

			if (!existingUser) {
				await insertNewUser({
					id: userId,
					name: registerUserFormData.data.name,
					username,
					email,
					isEmailVerified: false,
					password: hashedPassword,
					authMethods: []
				});
			} else {
				await db
					.update(usersTable)
					.set({
						password: hashedPassword
					})
					.where(eq(usersTable.email, email));
			}
			const emailVerificationCode = await generateEmailVerificationCode(userId, email);
			const sendEmailVerificationCodeResult = await sendEmailVerificationCode(
				email,
				emailVerificationCode
			);
			if (!sendEmailVerificationCodeResult.success) {
				return message(registerUserFormData, {
					alertType: 'error',
					alertText: sendEmailVerificationCodeResult.message
				});
			}

			const pendingVerificationUserData = JSON.stringify({ id: userId, email });

			cookies.set(pendingUserVerification, pendingVerificationUserData, {
				path: route('/auth/email-verification')
			});
		} catch (error) {
			logError(error);

			return message(registerUserFormData, {
				alertType: 'error',
				alertText: 'An error occurred while processing your request. Please try again.'
			});
		}

		redirect(303, route('/auth/email-verification'));
	}
};
