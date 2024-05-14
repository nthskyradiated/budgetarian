import { type InferSelectModel, relations, sql } from 'drizzle-orm';
import { text, int, sqliteTable } from 'drizzle-orm/sqlite-core';
import session from './sessions';

const usersTable = sqliteTable('users', {
	id: text('id').primaryKey().notNull(),
	name: text('name', { length: 255 }),
	username: text('username', { length: 255 }).unique(),
	email: text('email', { length: 255 }).notNull().unique(),
	password: text('password', { length: 255 }),
	isEmailVerified: int('is_email_verified', { mode: 'boolean' }).default(false),
	avatarUrl: text('avatar_url'),
	authMethods: text('auth_methods', { mode: 'json' }).$type<string[]>().notNull(),
	stripeCustomerId: text('stripe_customer_id', { length: 100 }).unique(),
	createdAt: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`)
});

export const userRelations = relations(usersTable, ({ many }) => ({
	sessions: many(session)
}));

export default usersTable;

export type Users = InferSelectModel<typeof usersTable>;
export type UserInsertSchema = typeof usersTable.$inferInsert;
