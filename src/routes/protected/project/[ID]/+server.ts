import type { RequestHandler } from '@sveltejs/kit';
import db from '@/db'; // Adjust the import to match your project's structure
import { and, count, eq } from 'drizzle-orm';
import { json, redirect } from '@sveltejs/kit';
import { expensesTable, inflowsTable } from '@/db/schema';
import projects from '@/db/schema/projectsSchema/projects';
// import type { Expenses } from '@/db/schema/projectsSchema/expenses';
// import type { Inflows } from '@/db/schema/projectsSchema/inflows';

export const GET: RequestHandler = async ({ locals, params, url }) => {
	const { ID } = params;

	if (!locals.user) {
		redirect(302, '/auth/login');
	}
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const pageSize = parseInt(url.searchParams.get('pageSize') ?? '10', 10);
	const offset = (page - 1) * pageSize;

	try {
		// Fetch all transactions from inflowsTable
		const income = await db
			.select()
			.from(inflowsTable)
			.where(
				and(eq(inflowsTable.projectId, ID as string), eq(inflowsTable.userId, locals.user?.id))
			)
			.execute();

		// Fetch all transactions from expensesTable
		const expenses = await db
			.select()
			.from(expensesTable)
			.where(
				and(eq(expensesTable.projectId, ID as string), eq(expensesTable.userId, locals.user?.id))
			)
			.execute();

		const project = await db
			.select()
			.from(projects)
			.where(eq(projects.id, ID as string))
			.execute();

		// Combine and sort results by createdAt date
		const incomeWithSource = income.map((entry) => ({ ...entry, type: 'income' }));
		const expensesWithSource = expenses.map((entry) => ({ ...entry, type: 'expense' }));
		const allTransactions = [...incomeWithSource, ...expensesWithSource].sort((a, b) => {
			const createdAtA = a.createdAt !== null ? new Date(a.createdAt).getTime() : 0;
			const createdAtB = b.createdAt !== null ? new Date(b.createdAt).getTime() : 0;
			return createdAtB - createdAtA;
		});

		// Implement pagination on the sorted results
		const paginatedTransactions = allTransactions.slice(offset, offset + pageSize);

		// Fetch the total count for pagination
		const totalIncomeCount = await db
			.select({
				count: count(inflowsTable.id)
			})
			.from(inflowsTable)
			.where(
				and(eq(inflowsTable.projectId, ID as string), eq(inflowsTable.userId, locals.user?.id))
			)
			.execute()
			.then((rows) => rows[0]?.count || 0);

		const totalExpensesCount = await db
			.select({
				count: count(expensesTable.id)
			})
			.from(expensesTable)
			.where(
				and(eq(expensesTable.projectId, ID as string), eq(expensesTable.userId, locals.user?.id))
			)
			.execute()
			.then((rows) => rows[0]?.count || 0);

		const totalCount = totalIncomeCount + totalExpensesCount;
		const totalPages = Math.ceil(totalCount / pageSize);
		console.log('current page number: ', page)
		console.log('current page size: ', pageSize)
		console.log('current total number of pages: ', totalPages);
		console.log('current total number of transactions: ', totalCount);

		return json(
			{
				allTransactions: paginatedTransactions,
				project,
				pagination: { page, pageSize, totalCount, totalPages }
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error fetching transactions:', error);
		return json({ error: 'An error occurred while fetching transactions.' }, { status: 500 });
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

// export const GET: RequestHandler = async ({ locals, params }) => {
// 	const { ID } = params;
// 	if (!locals.user) {
// 		redirect(302, '/auth/login');
// 	}

// 	try {
// 		const income = await db.query.inflowsTable.findMany({
// 			where: and(eq(inflowsTable.projectId, ID as string), eq(inflowsTable.userId, locals.user?.id))
// 		});
// 		const expenses = await db.query.expensesTable.findMany({
// 			where: and(
// 				eq(expensesTable.projectId, ID as string),
// 				eq(expensesTable.userId, locals.user?.id)
// 			)
// 		});
// 		const project = await db
// 			.select()
// 			.from(projects)
// 			.where(eq(projects.id, ID as string));

// 		const incomeWithSource = income.map((entry) => ({ ...entry, type: 'income' }));
// 		const expensesWithSource = expenses.map((entry) => ({ ...entry, type: 'expense' }));
// 		const allTransactions = [...incomeWithSource, ...expensesWithSource]
// 			.sort((a, b) => {
// 				const createdAtA = a.createdAt !== null ? new Date(a.createdAt).getTime() : 0;
// 				const createdAtB = b.createdAt !== null ? new Date(b.createdAt).getTime() : 0;
// 				return createdAtA - createdAtB;
// 			})
// 			.reverse();
// 		return json({ allTransactions, project }, { status: 200 });
// 	} catch (error) {
// 		console.error('Error fetching projects:', error);
// 		return json({ error: 'An error occurred while fetching projects.' }, { status: 500 });
// 	}
// };
