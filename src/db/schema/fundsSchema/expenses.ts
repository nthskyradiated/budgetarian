import { type InferSelectModel, relations, sql } from 'drizzle-orm';
import { text, int, real, sqliteTable } from 'drizzle-orm/sqlite-core';
import funds from './funds';

const expensesTable = sqliteTable('expenses', {
	id: int('id').primaryKey().notNull(),
	name: text('name', { length: 64 }).notNull(),
	category: text('category', { length: 64 }).notNull(),
	amount: real('amount').notNull(),
	fundId: text('fund_id')
		.notNull()
		.references(() => funds.id, { onDelete: 'cascade' }),
	isRecurring: int('is_recurring', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`)
});

export const expensesRelations = relations(expensesTable, ({ one }) => ({
	funds: one(funds)
}));

export default expensesTable;

export type Expenses = InferSelectModel<typeof expensesTable>;
export type ExpenseInsertSchema = typeof expensesTable.$inferInsert;
