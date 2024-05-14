import { type InferSelectModel } from 'drizzle-orm';
import { text, int, sqliteTable } from 'drizzle-orm/sqlite-core';

import funds from "./funds"
import inflowsCategories from "./inflowsCategories"


const fundsInflowsCategoriesTable = sqliteTable('funds_inflows_categories', {
	id: int('id').primaryKey().notNull(),
    fundId: text('fund_id')
	.notNull()
	.references(() => funds.id, {onDelete: 'cascade'}),
    categoryId: text('inflow_category_id')
	.notNull()
	.references(() => inflowsCategories.id, {onDelete: 'cascade'}),
});


export default fundsInflowsCategoriesTable;

export type FundsInflowsCategories = InferSelectModel<typeof fundsInflowsCategoriesTable>;
