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
		const recentProjects = await db
			.select()
			.from(projects)
			.where(eq(projects.userId, userId))
			.limit(3)
			.orderBy(desc(projects.updatedAt));
		return json({ recentProjects }, { status: 200 });
	} catch (error) {
		console.error('Error fetching projects:', error);
		return json({ error: 'An error occurred while fetching projects.' }, { status: 500 });
	}
};
