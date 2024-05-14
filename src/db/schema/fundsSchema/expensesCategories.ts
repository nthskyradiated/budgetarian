import { type InferSelectModel } from 'drizzle-orm';
import { text, int, sqliteTable } from 'drizzle-orm/sqlite-core';


const expensesCategoriesTable = sqliteTable('expenses_categories', {
	id: int('id').primaryKey().notNull(),
	name: text('name', { length: 64 }).notNull().unique(),
});


export default expensesCategoriesTable;

export type ExpensesCategories = InferSelectModel<typeof expensesCategoriesTable>;
export type ExpensesCategoresInsertSchema = typeof expensesCategoriesTable.$inferInsert;
