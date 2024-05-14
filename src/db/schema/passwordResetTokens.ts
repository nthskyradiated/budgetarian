import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import users from './users';
import type { InferSelectModel } from 'drizzle-orm';

export const passwordResetTokensTable = sqliteTable('password_reset_tokens', {
	id: text('id').primaryKey().notNull().unique(),

	userId: text('user_id')
		.notNull()
		.references(() => users.id),

	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export default passwordResetTokensTable;
export type PasswordResetTokens = InferSelectModel<typeof passwordResetTokensTable>;
