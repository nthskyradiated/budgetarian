import { type InferSelectModel } from 'drizzle-orm';
import { text, int, sqliteTable } from 'drizzle-orm/sqlite-core';


const inflowsCategoriesTable = sqliteTable('inflows_categories', {
	id: int('id').primaryKey().notNull(),
	name: text('name', { length: 64 }).notNull().unique(),
});


export default inflowsCategoriesTable;

export type InflowsCategories = InferSelectModel<typeof inflowsCategoriesTable>;
export type InflowsCategoriesInsertSchema = typeof inflowsCategoriesTable.$inferInsert;
