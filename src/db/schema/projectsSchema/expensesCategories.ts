import { relations, type InferSelectModel } from 'drizzle-orm';
import { text, int, sqliteTable } from 'drizzle-orm/sqlite-core';
import expenses from './expenses';

const expensesCategoriesTable = sqliteTable('expenses_categories', {
	id: int('id').primaryKey().notNull(),
	name: text('name', { length: 64 }).notNull().unique()
});

export default expensesCategoriesTable;

export const expensesCategoriesRelations = relations(expensesCategoriesTable, ({ many }) => ({
	expenses: many(expenses)
  }));

export type ExpensesCategories = InferSelectModel<typeof expensesCategoriesTable>;
export type ExpensesCategoresInsertSchema = typeof expensesCategoriesTable.$inferInsert;
