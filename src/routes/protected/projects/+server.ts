// src/routes/protected/projects/+server.ts

import type { RequestHandler } from '@sveltejs/kit';
import db from '@/db'; // Adjust the import to match your project's structure
import { eq } from 'drizzle-orm';
import projects from '@/db/schema/projectsSchema/projects';
import { json, redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const userId = locals.user.id;

	try {
		const allProjects = await db.select().from(projects).where(eq(projects.userId, userId));
		return json({ allProjects }, { status: 200 });
	} catch (error) {
		console.error('Error fetching projects:', error);
		return json({ error: 'An error occurred while fetching projects.' }, { status: 500 });
	}
};
