import { redirect } from '@sveltejs/kit';

import { route } from '@/lib/router';
import db from '@/db';
import { eq, desc } from 'drizzle-orm';
import projects from '@/db/schema/projectsSchema/projects';
import {
	ProjectZodSchema,
	UpdateProjectZodSchema,
	type projectZodSchema,
	type updateProjectZodSchema
} from '@/lib/zodValidators/zodProjectValidation.js';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate, message } from 'sveltekit-superforms/server';
import type { Actions } from './$types';
import { getProjectById, insertNewProject, updateProject } from '@/lib/utils/projectUtils';
import type { AlertMessageType } from '@/lib/types';
import { generateIdFromEntropySize, getUserSessions, invalidateSession } from '@/lib/server/authUtils';

export const load = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, route('/auth/login'));
	}

	const allProjects = await db
		.select()
		.from(projects)
		.where(eq(projects.userId, locals.user.id))
		.orderBy(desc(projects.createdAt));
	if (!allProjects) {
		throw new Error('invalid response from database');
	}
	if (allProjects.length === 0) {
		return {
			projects: [],
			message: 'No project found. Please create a new project.',
			createProjectFormData: await superValidate(zod(ProjectZodSchema), {
				id: 'createProjectForm'
			}),
			updateProjectFormData: await superValidate(zod(UpdateProjectZodSchema), {
				id: 'updateProjectForm'
			})
		};
	}

	return {
		allProjects,
		createProjectFormData: await superValidate(zod(ProjectZodSchema), { id: 'createProjectForm' }),
		updateProjectFormData: await superValidate(zod(UpdateProjectZodSchema), {
			id: 'updateProjectForm'
		})
	};
};

export const actions: Actions = {
	createProject: async ({ locals, request }) => {
		const userId = locals.user?.id;
		const currentSessionId = locals.session?.id;
		if (!userId || !currentSessionId) return;
		const createProjectFormData = await superValidate<projectZodSchema, AlertMessageType>(
			request,
			zod(ProjectZodSchema),
			{ id: 'createProjectForm' }
		);

		if (createProjectFormData.valid === false) {
			return message(createProjectFormData, {
				alertType: 'error',
				alertText: 'There was a problem with your submission.'
			});
		}

		const allUserSessions = await getUserSessions(userId);

		try {
			for (const session of allUserSessions) {
				if (session.id === currentSessionId) continue;

				await invalidateSession(session.id);
			}
			const projectId = generateIdFromEntropySize(10);
			await insertNewProject({
				id: projectId,
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
	},
	updateProject: async ({ locals, request }) => {
		const userId = locals.user?.id;
		const currentSessionId = locals.session?.id;
		if (!userId || !currentSessionId) return;

		const updateProjectFormData = await superValidate<updateProjectZodSchema, AlertMessageType>(
			request,
			zod(UpdateProjectZodSchema),
			{ id: 'updateProjectForm', strict: false }
		);

		if (updateProjectFormData.valid === false) {
			return message(updateProjectFormData, {
				alertType: 'error',
				alertText: 'There was a problem with your submission.'
			});
		}

		const allUserSessions = await getUserSessions(userId);

		try {
			for (const session of allUserSessions) {
				if (session.id === currentSessionId) continue;

				await invalidateSession(session.id);
			}
			const project = await getProjectById(updateProjectFormData.data.id);

			if (!project) {
				return message(
					updateProjectFormData,
					{
						alertType: 'error',
						alertText: 'There was a problem with your submission.'
					},
					{
						status: 500
					}
				);
			}
			if (project.userId !== locals.user?.id) {
				return message(
					updateProjectFormData,
					{
						alertType: 'error',
						alertText: 'You do not have permission to edit this project.'
					},
					{
						status: 403
					}
				);
			}
			const { name, details, startingFunds, id } = updateProjectFormData.data;
			const updateData = {
				id,
				name: !name || name === undefined || name === '' ? project.name : name,
				details: !details || details === undefined || details === '' ? project.details : details,
				startingFunds:
					!startingFunds || startingFunds === undefined ? project.startingFunds : startingFunds,
				totalFunds: project.totalFunds,
				userId: locals.user.id
			};

			if (startingFunds !== undefined) {
				updateData.startingFunds = startingFunds;
				updateData.totalFunds = startingFunds; // Assuming totalFunds is reset to startingFunds
			}

			await updateProject(updateData, id);
		} catch (error) {
			console.error('Error in createProject action:', error);
			return message(
				updateProjectFormData,
				{
					alertType: 'error',
					alertText: 'There was a problem with your submission.'
				},
				{
					status: 500
				}
			);
		}

		return message(updateProjectFormData, {
			alertType: 'success',
			alertText: 'Project Updated Successfully.'
		});
	}
};