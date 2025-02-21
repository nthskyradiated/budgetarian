// src/routes/protected/projects/+server.ts

import type { RequestHandler } from '@sveltejs/kit';
import db from '@/db';
import { desc, eq } from 'drizzle-orm';
import projects from '@/db/schema/projectsSchema/projects';
import { json, redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/auth/login');
	}

	const userId = locals.user.id;

	try {
		const allProjects = await db
			.select()
			.from(projects)
			.where(eq(projects.userId, userId))
			.orderBy(desc(projects.createdAt));
		if (!allProjects) {
			return json({ error: 'invalid response from database' }, { status: 500 });
		}

		if (allProjects.length === 0) {
			return json({ message: 'No projects found. Please create a new project.' }, { status: 200 });
		}
		return json({ allProjects }, { status: 200 });
	} catch (error) {
		console.error('Error fetching projects:', error);
		return json({ error: 'An error occurred while fetching projects.' }, { status: 500 });
	}
};
