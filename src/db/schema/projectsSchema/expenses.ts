import { type InferSelectModel, relations, sql } from 'drizzle-orm';
import { text, int, real, sqliteTable } from 'drizzle-orm/sqlite-core';
import projects from './projects';
import users from '../usersSchema/users';

const expensesTable = sqliteTable('expenses', {
	id: text('id').primaryKey().notNull(),
	name: text('name', { length: 64 }).notNull(),
	category: text('category', { length: 64 }).notNull(),
	amount: real('amount').notNull(),
	projectId: text('project_id')
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	isRecurring: int('is_recurring', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`)
});

export const expensesRelations = relations(expensesTable, ({ one }) => ({
	projects: one(projects),
	users: one(users)
}));

export default expensesTable;

export type Expenses = InferSelectModel<typeof expensesTable>;
export type ExpenseInsertSchema = typeof expensesTable.$inferInsert;
