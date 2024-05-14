import { type InferSelectModel } from 'drizzle-orm';
import { text, int, sqliteTable } from 'drizzle-orm/sqlite-core';

import funds from "../fundsSchema/funds"
import expensesCategories from "../fundsSchema/expensesCategories"


const fundsExpensesCategoriesTable = sqliteTable('funds_expenses_categories', {
	id: int('id').primaryKey().notNull(),
    fundId: text('fund_id')
	.notNull()
	.references(() => funds.id, {onDelete: 'cascade'}),
    categoryId: text('expense_category_id')
	.notNull()
	.references(() => expensesCategories.id, {onDelete: 'cascade'}),
});


export default fundsExpensesCategoriesTable;

export type FundsExpensesCategories = InferSelectModel<typeof fundsExpensesCategoriesTable>;
