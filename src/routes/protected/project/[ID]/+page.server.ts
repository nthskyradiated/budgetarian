import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import projects from '@/db/schema/projectsSchema/projects';
import db from '@/db';
import { eq, sql } from 'drizzle-orm';
import {
	UpdateProjectZodSchema,
	TransactionZodSchema,
	type updateProjectZodSchema
} from '@/lib/zodValidators/zodProjectValidation';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate, message } from 'sveltekit-superforms/server';
import {
	getPaginatedTransactions,
	getProjectById,
	insertNewExpense,
	insertNewInflow,
	updateProject,
	validateCategory
} from '@/lib/utils/projectUtils';
import { generateIdFromEntropySize, getUserSessions, invalidateSession } from '@/lib/server/authUtils';
// import { inflowsTable, expensesTable } from '@/db/schema/index';
import type { AlertMessageType } from '@/lib/types';

export const load = (async ({ locals, params, url }) => {
	if (!locals.user) {
		redirect(302, '/');
	}

	const { ID } = params;

	const project = await db.select().from(projects).where(eq(projects.id, ID));

	if (!project) {
		return new Error('Project not found');
	}
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const pageSize = parseInt(url.searchParams.get('pageSize') ?? '10', 10);
	const projectId = ID;
	const userId = locals.user.id;
	try {
		const result = await getPaginatedTransactions(page, pageSize, projectId, userId);
		if (!result) {
			return new Error('Project not found');
		}
		const initialPaginatedTransactions = result.paginatedTransactions;
		const transactionHistory = result.allTransactions;

		return {
			initialPaginatedTransactions,
			pagination: result.pagination,
			transactionHistory,
			ID,
			project: project[0],
			transactionFormData: await superValidate(zod(TransactionZodSchema)),
			updateProjectFormData: await superValidate(zod(UpdateProjectZodSchema), {
				id: 'updateProjectForm'
			})
		};
	} catch (error) {
		throw new Error('Error fetching transactions');
	}
}) satisfies PageServerLoad;

export const actions: Actions = {
	createTransaction: async ({ request, locals, params }) => {
		const transactionFormData = await superValidate(request, zod(TransactionZodSchema));
		if (transactionFormData.valid === false) {
			return message(transactionFormData, {
				alertType: 'error',
				alertText: 'There was a problem with your submission.'
			});
		}

		try {
			const userId = locals.user!.id;
			const projectId = params.ID;
			const name = transactionFormData.data.name;
			const amount = transactionFormData.data.amount;
			const isRecurring = transactionFormData.data.isRecurring;
			const transactionType = transactionFormData.data.transactionType.transactionType;
			const category = transactionFormData.data.transactionType.categories;
			const remarks = transactionFormData.data.remarks || null;

			// Validate the category
			const categoryId = await validateCategory(category, transactionType);

			if (!categoryId) {
				return message(transactionFormData, {
					alertType: 'error',
					alertText: 'Invalid category'
				});
			}
			const id = generateIdFromEntropySize(10);
			const currentTotalFunds = await db
				.select({ totalFunds: projects.totalFunds })
				.from(projects)
				.where(eq(projects.id, projectId));
			if (transactionType === 'income') {
				if (currentTotalFunds[0] !== undefined) {
					const newTotalFunds = currentTotalFunds[0].totalFunds + amount;
					await db
						.update(projects)
						.set({
							totalFunds: newTotalFunds,
							updatedAt: sql`CURRENT_TIMESTAMP`
						})
						.where(eq(projects.id, projectId));
				}
				await insertNewInflow({
					id,
					userId,
					projectId,
					name,
					amount,
					isRecurring,
					category: categoryId,
					remarks
				});
			} else if (transactionType === 'expenses') {
				if (currentTotalFunds[0] !== undefined) {
					const newTotalFunds = currentTotalFunds[0].totalFunds - amount;
					await db
						.update(projects)
						.set({
							totalFunds: newTotalFunds,
							updatedAt: sql`CURRENT_TIMESTAMP`
						})
						.where(eq(projects.id, projectId));
				}
				await insertNewExpense({
					id,
					userId,
					projectId,
					name,
					amount,
					isRecurring,
					category: categoryId,
					remarks
				});
			}
		} catch (error) {
			console.error(error);
			return message(transactionFormData, {
				alertType: 'error',
				alertText: error
			});
		}

		return message(transactionFormData, {
			alertType: 'success',
			alertText: 'Transaction added successfully'
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

			//@TODO do we reset totalfunds to startingfunds here?

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