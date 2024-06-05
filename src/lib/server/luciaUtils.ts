import { dev } from '$app/environment';
import { usersTable, sessionsTable } from '@/db/schema';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia, TimeSpan } from 'lucia';
import db from '@/db';

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
