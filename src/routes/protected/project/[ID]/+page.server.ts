import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import projects from '@/db/schema/projectsSchema/projects';
import db from '@/db';
import { eq } from 'drizzle-orm';

export const load = (async ({ locals, params }) => {
	if (!locals.user) {
		redirect(302, '/');
	}

	const { ID } = params;
	const projectId = Number(ID)
	const project = await db.select().from(projects).where(eq(projects.id, projectId));
	
	if (!project) {
		return new Error('Project not found');
	}

	return {
		ID,
		project: project[0]
	};
}) satisfies PageServerLoad;
