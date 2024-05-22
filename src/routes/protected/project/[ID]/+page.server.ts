import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import projects from '@/db/schema/projectsSchema/projects';
import db from '@/db';
import { and, eq, sql } from 'drizzle-orm';
import { TransactionZodSchema } from '@/lib/zodValidators/zodProjectValidation';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate, message } from 'sveltekit-superforms/server';
import { insertNewExpense, insertNewInflow } from '@/lib/utils/projectUtils';
import { generateIdFromEntropySize } from 'lucia';
import {inflowsTable, expensesTable} from '@/db/schema/index';

export const load = (async ({ locals, params }) => {
	if (!locals.user) {
		redirect(302, '/');
	}

	const { ID } = params;

	const project = await db.select().from(projects).where(eq(projects.id, ID));

	if (!project) {
		return new Error('Project not found');
	}
	
	const income = await db.query.inflowsTable.findMany({
		where: and(
			eq(inflowsTable.projectId, ID),
			eq(inflowsTable.userId, locals.user.id))
	})
	const expenses = await db.query.expensesTable.findMany({
		where: and(
			eq(expensesTable.projectId, ID),
			eq(expensesTable.userId, locals.user.id))
	})

	const incomeWithSource = income.map(entry => ({ ...entry, type: 'income' }));
	const expensesWithSource = expenses.map(entry => ({ ...entry, type: 'expense' }));
	const transactions = [...incomeWithSource, ...expensesWithSource];
	const transactionHistory = transactions.sort((a, b) => {
		const createdAtA = a.createdAt !== null ? new Date(a.createdAt).getTime() : 0;
  		const createdAtB = b.createdAt !== null ? new Date(b.createdAt).getTime() : 0;
		return createdAtA - createdAtB;
	  }).reverse();

	  console.log(transactionHistory)
	return {
		transactionHistory,
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
			const userId = locals.user!.id;
			const projectId = params.ID;
			const name = transactionFormData.data.name;
			const amount = transactionFormData.data.amount;
			const isRecurring = transactionFormData.data.isRecurring;
			const transactionType = transactionFormData.data.transactionType.transactionType;
			const category = transactionFormData.data.transactionType.categories;
			const remarks = transactionFormData.data.remarks || null
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
					category,
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
					category,
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

	}
};
