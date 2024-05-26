import { type InferSelectModel, relations, sql } from 'drizzle-orm';
import { text, int, real, sqliteTable } from 'drizzle-orm/sqlite-core';
import projects from './projects';
import users from '../usersSchema/users';
import inflowsCategories from './inflowsCategories';

const inflowsTable = sqliteTable('inflows', {
	id: text('id').primaryKey().notNull(),
	name: text('name', { length: 64 }).notNull(),
	category: int('category_id')
		.notNull()
		.references(() => inflowsCategories.id, { onDelete: 'restrict' }),
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

export const inflowsRelations = relations(inflowsTable, ({ one }) => ({
	project: one(projects, {
		fields: [inflowsTable.projectId],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [inflowsTable.userId],
		references: [users.id]
	}),
	category: one(inflowsCategories, {
		fields: [inflowsTable.category],
		references: [inflowsCategories.id]
	})
}));

export default inflowsTable;

export type Inflows = InferSelectModel<typeof inflowsTable>;
export type InflowInsertSchema = typeof inflowsTable.$inferInsert;
