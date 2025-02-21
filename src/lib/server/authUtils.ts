import db from '@/db';
import { eq, or } from 'drizzle-orm';
import { passwordResetTokensTable, usersTable, sessionsTable } from '@/db/schema';
import type { UserInsertSchema } from '@/db/schema/usersSchema/users';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import type { RequestEvent, Cookies } from '@sveltejs/kit';
import { Argon2id } from '@/lib/utils/argon2id';
import type { AlphabetPattern, Session, SessionValidationResult, User } from '@/lib/types';
import { TimeSpan } from '@/lib/types';

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

export function isWithinExpirationDate(date: Date): boolean {
	return Date.now() < date.getTime();
}

export function createDate(timeSpan: TimeSpan): Date {
	return new Date(Date.now() + timeSpan.milliseconds());
}

export const createAndSetSession = async (
	userId: string,
	token: string,
	cookies: Cookies
): Promise<Session> => {
	const session = await createSession(token, userId);

	cookies.set('session', token, {
		httpOnly: true,
		sameSite: 'lax',
		expires: session.expiresAt,
		path: '/'
	});

	return session;
};

export const createPasswordResetToken = async (userId: string) => {
	const tokenId = generateSessionToken();

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
	if (!user?.password) {
		return false;
	}

	// Verify the old password
	const isSamePassword = await new Argon2id().verify(user.password, newPassword);

	return isSamePassword;
};

export function alphabet(...patterns: AlphabetPattern[]): string {
	const patternSet = new Set<AlphabetPattern>(patterns);
	let result = '';
	for (const pattern of patternSet) {
		if (pattern === 'a-z') {
			result += 'abcdefghijklmnopqrstuvwxyz';
		} else if (pattern === 'A-Z') {
			result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		} else if (pattern === '0-9') {
			result += '0123456789';
		} else {
			result += pattern;
		}
	}
	return result;
}

export const generateIdFromEntropySize = (size: number) => {
	const buffer = crypto.getRandomValues(new Uint8Array(size));
	return encodeBase32LowerCaseNoPadding(buffer);
};

export const generateSessionToken = (): string => {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
};

export const createSession = async (token: string, userId: string): Promise<Session> => {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days from now

	const session: Session = {
		id: sessionId,
		userId,
		expiresAt
	};

	// Convert Date to Unix timestamp for SQLite storage
	await db.insert(sessionsTable).values({
		id: session.id,
		userId: session.userId,
		expiresAt: Math.floor(session.expiresAt.getTime() / 1000) // Convert to Unix timestamp
	});

	return session;
};

export const validateSessionToken = async (token: string): Promise<SessionValidationResult> => {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const results = await db
		.select({
			session: {
				id: sessionsTable.id,
				userId: sessionsTable.userId,
				expiresAt: sessionsTable.expiresAt
			},
			user: {
				id: usersTable.id,
				email: usersTable.email,
				username: usersTable.username,
				name: usersTable.name,
				avatarUrl: usersTable.avatarUrl,
				authMethods: usersTable.authMethods
			}
		})
		.from(sessionsTable)
		.innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
		.where(eq(sessionsTable.id, sessionId));

	const result = results[0];
	if (!result) {
		return { session: null, user: null };
	}

	const expiresAt = new Date(result.session.expiresAt * 1000);

	if (Date.now() >= expiresAt.getTime()) {
		await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
		return { session: null, user: null };
	}

	// Check if we need to extend the session
	if (Date.now() >= expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await db
			.update(sessionsTable)
			.set({
				expiresAt: Math.floor(newExpiresAt.getTime() / 1000)
			})
			.where(eq(sessionsTable.id, sessionId));
		expiresAt.setTime(newExpiresAt.getTime());
	}

	const session: Session = {
		id: result.session.id,
		userId: result.session.userId,
		expiresAt
	};

	const user: User = {
		id: result.user.id,
		email: result.user.email,
		username: result.user.username,
		name: result.user.name,
		avatarUrl: result.user.avatarUrl,
		authMethods: result.user.authMethods
	};

	return { session, user };
};

export const invalidateSession = (sessionId: string): void => {
	db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
};

export const invalidateAllSessions = async (userId: string): Promise<void> => {
	await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
};

export const setSessionTokenCookie = (
	event: RequestEvent,
	token: string,
	expiresAt: Date
): void => {
	event.cookies.set('session', token, {
		httpOnly: true,
		sameSite: 'lax',
		expires: expiresAt,
		path: '/'
	});
};

export const deleteSessionTokenCookie = (cookies: Cookies): void => {
	cookies.set('session', '', {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 0,
		path: '/'
	});
};

export const getUserSessions = async (userId: string): Promise<Session[]> => {
	const sessions = await db
		.select({
			id: sessionsTable.id,
			userId: sessionsTable.userId,
			expiresAt: sessionsTable.expiresAt
		})
		.from(sessionsTable)
		.where(eq(sessionsTable.userId, userId));

	return sessions.map((session) => ({
		id: session.id,
		userId: session.userId,
		expiresAt: new Date(session.expiresAt * 1000)
	}));
};