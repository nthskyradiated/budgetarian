import * as zodVal from '$lib/zodValidators/zodParams';
import { z } from 'zod';

export const EmailZodSchema = z
	.string()
	.email()
	.max(zodVal.maxEmailLen, zodVal.EMAIL_MAX_ERROR_MESSAGE);

const AdvancedPasswordSchema = z
	.string()
	.min(zodVal.minPwrdLen, zodVal.PASSWORD_MIN_ERROR_MESSAGE)
	.max(zodVal.maxPwrdLen, zodVal.PASSWORD_MAX_ERROR_MESSAGE)
	.refine((password) => /[a-z]/.test(password), { message: ' Requires a lowercase letter' })
	.refine((password) => /[A-Z]/.test(password), { message: ' Requires an uppercase letter' })
	.refine((password) => /\d/.test(password), { message: ' Requires a number' })
	.refine((password) => new RegExp(`[${zodVal.pwrdChars}]`).test(password), {
		message: zodVal.PASSWORD_SPECIAL_CHARS_MESSAGE
	});

export const RegisterUserZodSchema = z.object({
	name: z
		.string()
		.min(zodVal.minNameLen, zodVal.NAME_MIN_ERROR_MESSAGE)
		.max(zodVal.maxNameLen, zodVal.NAME_MAX_ERROR_MESSAGE),

	username: z
		.string()
		.min(zodVal.minNameLen, zodVal.NAME_MIN_ERROR_MESSAGE)
		.max(zodVal.maxNameLen, zodVal.NAME_MAX_ERROR_MESSAGE),

	email: EmailZodSchema,

	password: AdvancedPasswordSchema
});

export const UserLoginZodSchema = z.object({
	email: EmailZodSchema,
	password: z
		.string()
		.min(zodVal.minPwrdLen, zodVal.PASSWORD_MIN_ERROR_MESSAGE)
		.max(zodVal.maxPwrdLen, zodVal.PASSWORD_MAX_ERROR_MESSAGE)
});

export type userLoginZodSchema = z.infer<typeof UserLoginZodSchema>;
export type passwordResetEmailZodSchema = z.infer<typeof PasswordResetEmailZodSchema>;
export type passwordResetZodSchema = z.infer<typeof PasswordResetZodSchema>;

export const EmailVerificationCodeZodSchema = z.object({
	verificationCode: z.string().length(zodVal.emailVerificationCodeLen)
});

export const PasswordResetEmailZodSchema = UserLoginZodSchema.pick({ email: true });

export const PasswordResetZodSchema = z
	.object({
		newPassword: AdvancedPasswordSchema,
		confirmPassword: AdvancedPasswordSchema,
		passwordResetToken: z.string().optional()
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: " Passwords don't match",
		path: ['confirmPassword']
	});
