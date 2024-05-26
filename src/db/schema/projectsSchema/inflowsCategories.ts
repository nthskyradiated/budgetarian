import { relations, type InferSelectModel } from 'drizzle-orm';
import { text, int, sqliteTable } from 'drizzle-orm/sqlite-core';
import inflows from './inflows';

const inflowsCategoriesTable = sqliteTable('inflows_categories', {
	id: int('id').primaryKey().notNull(),
	name: text('name', { length: 64 }).notNull().unique()
});

export default inflowsCategoriesTable;

export const inflowsCategoriesRelations = relations(inflowsCategoriesTable, ({ many }) => ({
	inflows: many(inflows)
}));

export type InflowsCategories = InferSelectModel<typeof inflowsCategoriesTable>;
export type InflowsCategoriesInsertSchema = typeof inflowsCategoriesTable.$inferInsert;
