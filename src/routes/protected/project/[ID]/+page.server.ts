import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import projects from '@/db/schema/projectsSchema/projects';
import db from '@/db';
import { eq } from 'drizzle-orm';
import { TransactionZodSchema } from '@/lib/zodValidators/zodProjectValidation';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate, message } from 'sveltekit-superforms/server';
import { insertNewExpense, insertNewInflow } from '@/lib/utils/projectUtils';
import { generateIdFromEntropySize } from 'lucia';


export const load = (async ({ locals, params }) => {
	if (!locals.user) {
		redirect(302, '/');
	}

	const { ID } = params;

	const project = await db.select().from(projects).where(eq(projects.id, ID));
	
	if (!project) {
		return new Error('Project not found');
	}

	return {
		ID,
		project: project[0],
		transactionFormData: await superValidate(zod(TransactionZodSchema))
	};
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
			const userId  = locals.user!.id
			const projectId = params.ID
			const name = transactionFormData.data.name
			const amount = transactionFormData.data.amount
			const isRecurring = transactionFormData.data.isRecurring
			const transactionType = transactionFormData.data.transactionType.transactionType
			const category = transactionFormData.data.transactionType.categories
			const id = generateIdFromEntropySize(10);
			if (transactionType === 'income') {
				const currentTotalFunds = await db.select({totalFunds: projects.totalFunds}).from(projects).where(eq(projects.id, projectId));
				if (currentTotalFunds[0] !== undefined) {
					const newTotalFunds = currentTotalFunds[0].totalFunds + amount;
					await db.update(projects).set({
						totalFunds: newTotalFunds
					}).where(eq(projects.id, projectId));
				}
				await insertNewInflow({
					id,
					userId,
					projectId,
					name,
					amount,
					isRecurring,
					category
				})
			} else if (transactionType === 'expenses') {
				const currentTotalFunds = await db.select({totalFunds: projects.totalFunds}).from(projects).where(eq(projects.id, projectId));
				if (currentTotalFunds[0] !== undefined) {
					const newTotalFunds = currentTotalFunds[0].totalFunds - amount;
					await db.update(projects).set({
						totalFunds: newTotalFunds
					}).where(eq(projects.id, projectId));
				}
				await insertNewExpense({
					id,
					userId,
					projectId,
					name,
					amount,
					isRecurring,
					category
				})
			}
			
		} catch (error) {
			console.error(error);
		}
		return {
			transactionFormData
		}
	
}}