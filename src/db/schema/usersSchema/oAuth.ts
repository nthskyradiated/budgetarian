import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations, type InferSelectModel } from 'drizzle-orm';
import users from './users';

const oAuthTable = sqliteTable(
	'oauth_users',
	{
		userId: text('user_id')
			.notNull()
			.references(() => users.id),
		provider: text('provider').notNull(),
		providerUserId: text('provider_user_id').notNull()
	},
	(t) => ({
		pk: primaryKey({ columns: [t.provider, t.providerUserId] })
	})
);

export const oAuthRelations = relations(oAuthTable, ({ one }) => ({
	user: one(users, {
		fields: [oAuthTable.userId],
		references: [users.id]
	})
}));

export type OAth = InferSelectModel<typeof oAuthTable>;
export default oAuthTable;
