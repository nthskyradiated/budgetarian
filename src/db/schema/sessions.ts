import { relations, type InferSelectModel } from 'drizzle-orm';
import { text, int, sqliteTable } from 'drizzle-orm/sqlite-core';
import users from './users';

const sessionsTable = sqliteTable('session', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: int('expires_at').notNull()
});

export const sessionRelations = relations(sessionsTable, ({ one }) => ({
	user: one(users, {
		fields: [sessionsTable.userId],
		references: [users.id]
	})
}));

export type Sessions = InferSelectModel<typeof sessionsTable>;
export default sessionsTable;
