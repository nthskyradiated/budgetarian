import { type InferSelectModel, relations, sql } from 'drizzle-orm';
import { text, int, real, sqliteTable } from 'drizzle-orm/sqlite-core';
import projects from './projects';

const inflowsTable = sqliteTable('inflows', {
	id: int('id').primaryKey().notNull(),
	name: text('name', { length: 64 }).notNull(),
	category: text('category', { length: 64 }).notNull(),
	amount: real('amount').notNull(),
	projectId: text('project_id')
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	isRecurring: int('is_recurring', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});

export const expensesRelations = relations(inflowsTable, ({ one }) => ({
	projects: one(projects)
}));

export default inflowsTable;

export type Inflows = InferSelectModel<typeof inflowsTable>;
export type InflowInsertSchema = typeof inflowsTable.$inferInsert;
