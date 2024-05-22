
import type { RequestHandler } from '@sveltejs/kit';
import db from '@/db'; // Adjust the import to match your project's structure
import { and, eq } from 'drizzle-orm';
import { json, redirect } from '@sveltejs/kit';
import { expensesTable, inflowsTable } from '@/db/schema';

export const GET: RequestHandler = async ({ locals, params }) => {
    const { ID } = params;
	if (!locals.user) {
		redirect(302, '/auth/login');
	}

	try {
        const income = await db.query.inflowsTable.findMany({
            where: and(
                eq(inflowsTable.projectId, ID as string),
                eq(inflowsTable.userId, locals.user?.id))
        })
        const expenses = await db.query.expensesTable.findMany({
            where: and(
                eq(expensesTable.projectId, ID as string),
                eq(expensesTable.userId, locals.user?.id))
        })
    
        const incomeWithSource = income.map(entry => ({ ...entry, type: 'income' }));
        const expensesWithSource = expenses.map(entry => ({ ...entry, type: 'expense' }));
        const allTransactions = [...incomeWithSource, ...expensesWithSource].sort((a, b) => {
            const createdAtA = a.createdAt !== null ? new Date(a.createdAt).getTime() : 0;
              const createdAtB = b.createdAt !== null ? new Date(b.createdAt).getTime() : 0;
            return createdAtA - createdAtB;
          }).reverse();
		return json({ allTransactions }, { status: 200 });
	} catch (error) {
		console.error('Error fetching projects:', error);
		return json({ error: 'An error occurred while fetching projects.' }, { status: 500 });
	}
};
