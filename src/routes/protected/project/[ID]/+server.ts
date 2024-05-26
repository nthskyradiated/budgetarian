import type { RequestHandler } from '@sveltejs/kit';
import db from '@/db'; // Adjust the import to match your project's structure
import { and, eq } from 'drizzle-orm';
import { json, redirect } from '@sveltejs/kit';
import { expensesTable, inflowsTable } from '@/db/schema';
import projects from '@/db/schema/projectsSchema/projects';

export const GET: RequestHandler = async ({ locals, params }) => {
	const { ID } = params;
	if (!locals.user) {
		redirect(302, '/auth/login');
	}

	try {
		const income = await db.query.inflowsTable.findMany({
			where: and(eq(inflowsTable.projectId, ID as string), eq(inflowsTable.userId, locals.user?.id))
		});
		const expenses = await db.query.expensesTable.findMany({
			where: and(
				eq(expensesTable.projectId, ID as string),
				eq(expensesTable.userId, locals.user?.id)
			)
		});
		const project = await db
			.select()
			.from(projects)
			.where(eq(projects.id, ID as string));

		const incomeWithSource = income.map((entry) => ({ ...entry, type: 'income' }));
		const expensesWithSource = expenses.map((entry) => ({ ...entry, type: 'expense' }));
		const allTransactions = [...incomeWithSource, ...expensesWithSource]
			.sort((a, b) => {
				const createdAtA = a.createdAt !== null ? new Date(a.createdAt).getTime() : 0;
				const createdAtB = b.createdAt !== null ? new Date(b.createdAt).getTime() : 0;
				return createdAtA - createdAtB;
			})
			.reverse();
		return json({ allTransactions, project }, { status: 200 });
	} catch (error) {
		console.error('Error fetching projects:', error);
		return json({ error: 'An error occurred while fetching projects.' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) {
		redirect(302, '/auth/login');
	}
	const { ID } = params;
	if (ID) {
		try {
			const deleteProject = await db.delete(projects).where(eq(projects.id, ID));
			return json({ deleteProject }, { status: 200 });
		} catch (error) {
			console.error('Error deleting project:', error);
			return json({ error: 'An error occurred while deleting the project.' }, { status: 500 });
		}
	}
	return json({ message: 'No project ID provided' }, { status: 400 });
};
