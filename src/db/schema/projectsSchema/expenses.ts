import { type InferSelectModel, relations, sql } from 'drizzle-orm';
import { text, int, real, sqliteTable } from 'drizzle-orm/sqlite-core';
import projects from './projects';
import users from '../usersSchema/users';
import expensesCategories from './expensesCategories';

const expensesTable = sqliteTable('expenses', {
	id: text('id').primaryKey().notNull(),
	name: text('name', { length: 64 }).notNull(),
	category: int('category_id')
		.notNull()
		.references(() => expensesCategories.id, { onDelete: 'restrict' }),
	amount: real('amount').notNull(),
	remarks: text('remarks', { length: 255 }),
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
	project: one(projects, {
		fields: [expensesTable.projectId],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [expensesTable.userId],
		references: [users.id]
	}),
	category: one(expensesCategories, {
		fields: [expensesTable.category],
		references: [expensesCategories.id]
	})
}));

export default expensesTable;

export type Expenses = InferSelectModel<typeof expensesTable>;
export type ExpenseInsertSchema = typeof expensesTable.$inferInsert;
