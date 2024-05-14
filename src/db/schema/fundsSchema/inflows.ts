import { type InferSelectModel, relations, sql } from 'drizzle-orm';
import { text, int, real, sqliteTable } from 'drizzle-orm/sqlite-core';
import funds from "./funds"

const inflowsTable = sqliteTable('inflows', {
	id: int('id').primaryKey().notNull(),
	name: text('name', { length: 64 }).notNull(),
	category: text('category', { length: 64 }).notNull(),
	amount: real('amount').notNull(),
    fundId: text('fund_id')
	.notNull()
	.references(() => funds.id, {onDelete: 'cascade'}),
	isRecurring: int('is_recurring', {mode: "boolean"}).notNull().default(false),
	createdAt: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`),
});

export const expensesRelations = relations(inflowsTable, ({ one }) => ({
	funds: one(funds)
}));

export default inflowsTable;

export type Inflows = InferSelectModel<typeof inflowsTable>;
export type InflowInsertSchema = typeof inflowsTable.$inferInsert;
