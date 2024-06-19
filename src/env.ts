import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

import { ZodError, z } from 'zod';

const stringBoolean = z.coerce
	.string()
	.transform((val) => {
		return val === 'true';
	})
	.default('false');

const EnvSchema = z.object({
	NODE_ENV: z.string().default('development'),
	DB_HOST: z.string(),
	DB_USER: z.string(),
	DB_PASSWORD: z.string(),
	DB_NAME: z.string(),
	DB_PORT: z.coerce.number(),
	DATABASE_URL: z.string(),
	DEV_URL: z.string(),
	PUBLIC_URL: z.string(),
	DB_MIGRATING: stringBoolean,
	DB_SEEDING: stringBoolean,
	GITHUB_CLIENT_ID: z.string(),
	GITHUB_CLIENT_SECRET: z.string(),
	GOOGLE_CLIENT_ID: z.string(),
	GOOGLE_CLIENT_SECRET: z.string(),
	RESEND_API_KEY: z.string(),
	PLUNK_API_KEY: z.string()
});

export type EnvSchema = z.infer<typeof EnvSchema>;

expand(config());

try {
	EnvSchema.parse(process.env);
} catch (error) {
	if (error instanceof ZodError) {
		let message = 'Missing required values in .env:\n';
		error.issues.forEach((issue) => {
			message += issue.path[0] + '\n';
		});
		const e = new Error(message);
		e.stack = '';
		throw e;
	} else {
		console.error(error);
	}
}

export default EnvSchema.parse(process.env);
