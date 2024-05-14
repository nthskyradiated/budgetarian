import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { type InferSelectModel } from 'drizzle-orm';
import users from './users';

export const emailVerificationCodesTable = sqliteTable('email_verification_codes', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),

	userId: text('user_id')
		.notNull()
		.references(() => users.id),

	code: text('code').notNull(),

	email: text('email').notNull(),

	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export default emailVerificationCodesTable;
export type EmailVerificationCodes = InferSelectModel<typeof emailVerificationCodesTable>;
