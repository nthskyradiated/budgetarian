import db from '@/db';
import { eq, or } from 'drizzle-orm';
import { passwordResetTokensTable, usersTable } from '@/db/schema';
import type { UserInsertSchema } from '@/db/schema/users';
import { generateId, type Lucia } from 'lucia';
import type { Cookies } from '@sveltejs/kit';
import { createDate, isWithinExpirationDate, TimeSpan } from 'oslo';
import { Argon2id } from 'oslo/password';

export const checkIfUserExists = async (email: string, username: string) => {
	const [existingUser] = await db
		.select({
			id: usersTable.id,
			email: usersTable.email,
			password: usersTable.password,
			isEmailVerified: usersTable.isEmailVerified,
			authMethods: usersTable.authMethods,
			username: usersTable.username
		})
		.from(usersTable)
		.where(or(eq(usersTable.email, email), eq(usersTable.username, username)));

	return existingUser;
};
export const checkIfCurrUserExists = async (email: string) => {
	const [existingUser] = await db
		.select({
			id: usersTable.id,
			email: usersTable.email,
			password: usersTable.password,
			isEmailVerified: usersTable.isEmailVerified,
			authMethods: usersTable.authMethods,
			username: usersTable.username
		})
		.from(usersTable)
		.where(eq(usersTable.email, email));

	return existingUser;
};

export const insertNewUser = async (user: UserInsertSchema) => {
	return await db.insert(usersTable).values(user);
};

export const deleteSessionCookie = async (lucia: Lucia, cookies: Cookies) => {
	const sessionCookie = lucia.createBlankSessionCookie();

	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});
};

export const createAndSetSession = async (lucia: Lucia, userId: string, cookies: Cookies) => {
	const session = await lucia.createSession(userId, {});
	const sessionCookie = lucia.createSessionCookie(session.id);

	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});
};

export const createPasswordResetToken = async (userId: string) => {
	const tokenId = generateId(40);

	await db.transaction(async (trx) => {
		await trx.delete(passwordResetTokensTable).where(eq(passwordResetTokensTable.userId, userId));

		await trx.insert(passwordResetTokensTable).values({
			id: tokenId,
			userId,
			expiresAt: createDate(new TimeSpan(15, 'm')) // 15 minutes
		});
	});

	return tokenId;
};

export const verifyPasswordResetToken = async (tokenId: string) => {
	const [passwordResetToken] = await db
		.select()
		.from(passwordResetTokensTable)
		.where(eq(passwordResetTokensTable.id, tokenId));

	if (!passwordResetToken || passwordResetToken.id !== tokenId) {
		return {
			success: false,
			message: 'The password reset link is invalid. Please request a new one.'
		};
	}

	if (!isWithinExpirationDate(passwordResetToken.expiresAt)) {
		return {
			success: false,
			message: 'The password reset link has expired. Please request a new one.'
		};
	}

	return {
		success: true,
		userId: passwordResetToken.userId,
		message: 'Password reset token is valid.'
	};
};

export const isSameAsOldPassword = async (userId: string, newPassword: string) => {
	const [user] = await db
		.select({
			password: usersTable.password
		})
		.from(usersTable)
		.where(eq(usersTable.id, userId));

	// If user doesn't exist or password is null, return false
	if (!user || user.password === null) {
		return false;
	}

	// Verify the old password
	const isSamePassword = await new Argon2id().verify(user.password, newPassword);

	return isSamePassword;
};
