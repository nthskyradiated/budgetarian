import { alphabet, generateRandomString } from 'oslo/crypto';
import { emailVerificationCodeLen } from '../zodValidators/zodParams';
import db from '@/db';
import { emailVerificationCodesTable } from '@/db/schema';
import { createDate, isWithinExpirationDate, TimeSpan } from 'oslo';
import type { EmailParams } from '../types';
import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';
import { eq } from 'drizzle-orm';
import { route } from '../router';

const resend = new Resend(RESEND_API_KEY);

export const pendingUserVerification = 'pendingUserVerification';

export const generateEmailVerificationCode = async (userId: string, email: string) => {
	const code = generateRandomString(emailVerificationCodeLen, alphabet('0-9'));

	// This transaction block ensures atomicity and data integrity. If an error occurs while inserting the new code, the transaction will be rolled back, preventing the deletion of old verification codes. This maintains the state of the database.
	await db.transaction(async (trx) => {
		// Delete any existing verification codes for the user
		await trx
			.delete(emailVerificationCodesTable)
			.where(eq(emailVerificationCodesTable.userId, userId));

		// Insert the new verification code
		await trx.insert(emailVerificationCodesTable).values({
			userId,
			email,
			code,
			expiresAt: createDate(new TimeSpan(5, 'm')) // 5 minutes
		});
	});

	return code;
};

export const sendEmailVerificationCode = async (email: string, code: string) => {
	const htmlContent = `
	<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
		<h1>Email Verification</h1>
		<p>Thank you for signing up! Your verification code is:</p>
		<p style="font-size: 20px;"><strong>${code}</strong></p>
		<p>Please enter this code in the verification field to complete the process. If you did not request this verification, please ignore this email.</p>
	</div>
	`;

	return sendEmail({
		email,
		subject: 'Email Verification Code Request for Handshakes.Me',
		htmlContent
	});
};

const sendEmail = async ({ email, subject, htmlContent }: EmailParams) => {
	const { error } = await resend.emails.send({
		from: 'Handshakes.Me <onboarding@resend.dev>',
		to: [email],
		subject,
		html: htmlContent
	});

	if (error) {
		console.error({ error });
		return { success: false, message: `Failed to send email: ${error.message}` };
	}

	return {
		success: true,
		message: `An email has been sent to ${email} with the subject: ${subject}.`
	};
};

export const verifyEmailVerificationCode = async (userId: string, code: string) => {
	const [verificationCode] = await db
		.select()
		.from(emailVerificationCodesTable)
		.where(eq(emailVerificationCodesTable.userId, userId));

	// If there's no verification code for the user in the database
	if (!verificationCode) {
		return { success: false, message: 'Verification code not found.' };
	}

	// If the provided code doesn't match the one in the database
	if (verificationCode.code !== code) {
		return { success: false, message: 'The provided verification code is incorrect.' };
	}

	// If the verification code has expired
	if (!isWithinExpirationDate(verificationCode.expiresAt)) {
		return {
			success: false,
			message: 'The verification code has expired, please request a new one.'
		};
	}

	// If everything is okay, delete the verification code from the database
	await db
		.delete(emailVerificationCodesTable)
		.where(eq(emailVerificationCodesTable.userId, userId));

	// Return a success message
	return { success: true, message: 'Email verification successful!' };
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
	const htmlContent = `
	<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
		<h1>Password Reset Request</h1>
		<p>We've received a request to reset your password. If you didn't make the request, just ignore this email. Otherwise, you can reset your password using the link below.</p>

		<p>
		<a href="http://localhost:5173${route('/auth/password-reset')}?token=${resetToken}" style="color: #337ab7; text-decoration: none;">Reset your password</a>
		</p>

		<p>If you need help or have any questions, please contact our support team. We're here to help!</p>
	</div>
	`;

	return sendEmail({
		email,
		subject: 'Password Reset Request',
		htmlContent
	});
};
