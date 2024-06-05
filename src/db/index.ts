import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '@/db/schema/';
import env from '@/env';

export const connection = createClient({
	url: env.TURSO_CONNECTION_URL,
	authToken: env.TURSO_AUTH_TOKEN
});

export const db = drizzle(connection, {
	schema
	// logger: true
});

export type db = typeof db;

export default db;
