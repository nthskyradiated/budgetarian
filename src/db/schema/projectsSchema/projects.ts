import { type InferSelectModel, relations, sql } from 'drizzle-orm';
import { text, int, sqliteTable, real } from 'drizzle-orm/sqlite-core';
import users from '../usersSchema/users';
import expenses from './expenses';
import inflows from './inflows';

const projectsTable = sqliteTable('projects', {
	id: int('id').primaryKey().notNull(),
	name: text('name', { length: 255 }).notNull().unique(),
	details: text('details', { length: 255 }).notNull(),
	startingFunds: real('starting_funds').notNull(),
	totalFunds: real('total_funds').notNull(),
	createdAt: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
});

export const fundsRelations = relations(projectsTable, ({ one, many }) => ({
	users: one(users),
	expenses: many(expenses),
	inflows: many(inflows)
}));

export default projectsTable;

export type Projects = InferSelectModel<typeof projectsTable>;
export type ProjectInsertSchema = typeof projectsTable.$inferInsert;
