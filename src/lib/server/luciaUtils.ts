import { dev } from '$app/environment';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import sqlite from 'better-sqlite3';
import { usersTable, sessionsTable } from '@/db/schema';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { DATABASE_URL } from '$env/static/private';
import { Lucia, TimeSpan } from 'lucia';

const sqliteDB = sqlite(DATABASE_URL);
const db = drizzle(sqliteDB);
const adapter = new DrizzleSQLiteAdapter(db, sessionsTable, usersTable);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			// set to `true` when using HTTPS
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			id: attributes.id,
			email: attributes.email,
			avatarUrl: attributes.avatarUrl,
			name: attributes.name,
			username: attributes.username,
			authMethods: attributes.authMethods
		};
	},
	sessionExpiresIn: new TimeSpan(2, 'd') // 2 weeks
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			id: string;
			email: string;
			avatarUrl?: string;
			name?: string;
			username?: string;
			authMethods: string[];
		};
	}
}
