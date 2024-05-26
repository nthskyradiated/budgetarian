import db from '@/db';
import type { RequestHandler } from './$types';
import { eq, sql } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import { expensesTable, inflowsTable, projectsTable } from '@/db/schema';

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const transactionId = params.ID;

	if (!locals.user) {
		redirect(302, '/auth/login');
	}

	// Check if the transaction exists in inflowsTable
	const inflow = await db
		.select({ id: inflowsTable.id, amount: inflowsTable.amount, projectId: inflowsTable.projectId })
		.from(inflowsTable)
		.where(eq(inflowsTable.id, transactionId))
		.limit(1);

	// Check if the transaction exists in expensesTable
	const expense = await db
		.select({
			id: expensesTable.id,
			amount: expensesTable.amount,
			projectId: expensesTable.projectId
		})
		.from(expensesTable)
		.where(eq(expensesTable.id, transactionId))
		.limit(1);

	if (inflow.length > 0) {
		const { amount, projectId } = inflow[0] as { id: string; amount: number; projectId: string };

		// Reverse the amount in the project's totalFunds
		await db
			.update(projectsTable)
			.set({ totalFunds: sql`${projectsTable.totalFunds} - ${amount}` })
			.where(eq(projectsTable.id, projectId));

		// Delete the inflow transaction
		await db.delete(inflowsTable).where(eq(inflowsTable.id, transactionId));

		return new Response('Transaction deleted successfully', { status: 200 });
	} else if (expense.length > 0) {
		const { amount, projectId } = expense[0] as { id: string; amount: number; projectId: string };

		// Add the amount back to the project's totalFunds
		await db
			.update(projectsTable)
			.set({ totalFunds: sql`${projectsTable.totalFunds} + ${amount}` })
			.where(eq(projectsTable.id, projectId));

		// Delete the expense transaction
		await db.delete(expensesTable).where(eq(expensesTable.id, transactionId));

		return new Response('Transaction deleted successfully', { status: 200 });
	}

	return new Response('Transaction not found', { status: 404 });
};
