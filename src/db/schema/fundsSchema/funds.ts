import { type InferSelectModel, relations, sql } from 'drizzle-orm';
import { text, int, real, sqliteTable } from 'drizzle-orm/sqlite-core';
import users from "../usersSchema/users"
import expenses from "../fundsSchema/expenses"
import inflows from "../fundsSchema/inflows"


const fundsTable = sqliteTable('funds', {
	id: int('id').primaryKey().notNull(),
	name: text('name', { length: 255 }).notNull(),
	totalFunds: real('total_funds').notNull().default(0),
	createdAt: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`),
    userId: text('user_id')
			.notNull()
			.references(() => users.id, {onDelete: 'cascade'}),
});

export const fundsRelations = relations(fundsTable, ({ one, many }) => ({
	users: one(users),
	expenses: many(expenses),
	inflows: many(inflows),
	
}));

export default fundsTable;

export type Funds = InferSelectModel<typeof fundsTable>;
export type FundInsertSchema = typeof fundsTable.$inferInsert;
