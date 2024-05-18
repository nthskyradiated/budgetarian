import { redirect } from '@sveltejs/kit';

import { route } from '@/lib/router';
import db from '@/db';
import { eq } from 'drizzle-orm';
import projects from '@/db/schema/projectsSchema/projects';
import {
	CreateProjectZodSchema,
	type createProjectZodSchema
} from '@/lib/zodValidators/zodProjectValidation.js';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate, message } from 'sveltekit-superforms/server';
import { lucia } from '@/lib/server/luciaUtils';
import type { Actions } from './$types';
import { insertNewProject } from '@/lib/utils/projectUtils';
import type { AlertMessageType } from '@/lib/types';

export const load = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, route('/auth/login'));
	}

	const allProjects = await db.select().from(projects).where(eq(projects.userId, locals.user.id));
	if (!allProjects) {
		throw new Error('invalid response from database');
	}
	if (allProjects.length === 0) {
		return {
			projects: [],
			message: 'No projects found. Please create a new project.',
			createProjectFormData: await superValidate(zod(CreateProjectZodSchema))
		};
	}

	return {
		allProjects,
		createProjectFormData: await superValidate(zod(CreateProjectZodSchema))
	};
};

export const actions: Actions = {
	createProject: async ({ locals, request }) => {
		const userId = locals.user?.id;
		const currentSessionId = locals.session?.id;
		if (!userId || !currentSessionId) return;

		const createProjectFormData = await superValidate<createProjectZodSchema, AlertMessageType>(
			request,
			zod(CreateProjectZodSchema)
		);

		if (createProjectFormData.valid === false) {
			return message(createProjectFormData, {
				alertType: 'error',
				alertText: 'There was a problem with your submission.'
			});
		}
		console.log('value:', createProjectFormData.data);

		const allUserSessions = await lucia.getUserSessions(userId);

		try {
			for (const session of allUserSessions) {
				if (session.id === currentSessionId) continue;

				await lucia.invalidateSession(session.id);
			}

			await insertNewProject({
				name: createProjectFormData.data.name,
				details: createProjectFormData.data.details,
				startingFunds: createProjectFormData.data.startingFunds,
				totalFunds: createProjectFormData.data.startingFunds,
				userId
			});
		} catch (error) {
			console.error('Error in createProject action:', error);
			return message(
				createProjectFormData,
				{
					alertType: 'error',
					alertText: 'There was a problem with your submission.'
				},
				{
					status: 500
				}
			);
		}

		return message(createProjectFormData, {
			alertType: 'success',
			alertText: 'New Project Added.'
		});
	}
};
