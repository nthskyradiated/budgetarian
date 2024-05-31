import db from '@/db';
import {
	expensesTable,
	inflowsTable,
	projectsTable,
	inflowsCategoriesTable,
	expensesCategoriesTable
} from '@/db/schema';
import type { ExpenseInsertSchema } from '@/db/schema/projectsSchema/expenses';
import type { InflowInsertSchema } from '@/db/schema/projectsSchema/inflows';
import type { ProjectInsertSchema } from '@/db/schema/projectsSchema/projects';
import projects from '@/db/schema/projectsSchema/projects';
import { and, count, eq } from 'drizzle-orm';

export const insertNewProject = async (project: ProjectInsertSchema) => {
	return await db.insert(projectsTable).values(project).returning();
};

export const getAllProjects = async (id: string) => {
	return await db.select().from(projects).where(eq(projects.userId, id));
};

export const getProjectById = async (id: string) => {
	return await db.query.projectsTable.findFirst({ where: eq(projects.id, id) });
};

export const updateProject = async (project: ProjectInsertSchema, id: string) => {
	return await db.update(projectsTable).set(project).where(eq(projects.id, id));
};
export const deleteProject = async (id: string) => {
	return await db.delete(projects).where(eq(projects.id, id));
};

export const insertNewInflow = async (transaction: InflowInsertSchema) => {
	return await db.insert(inflowsTable).values(transaction).returning();
};
export const insertNewExpense = async (transaction: ExpenseInsertSchema) => {
	return await db.insert(expensesTable).values(transaction).returning();
};
export const deleteInflow = async (id: string) => {
	return await db.delete(inflowsTable).where(eq(inflowsTable.id, id));
};
export const deleteExpense = async (id: string) => {
	return await db.delete(expensesTable).where(eq(expensesTable.id, id));
};

export const validateCategory = async (category: string, type: 'income' | 'expenses') => {
	const table = type === 'income' ? inflowsCategoriesTable : expensesCategoriesTable;

	const result = await db.select().from(table).where(eq(table.name, category));
	if (result.length > 0) {
		return result[0]?.id;
	}
	return null;
};

// export const getTransactionType = async (transactionId: string) => {
// 	const inflow = await db
// 		.select({ id: inflowsTable.id })
// 		.from(inflowsTable)
// 		.where(eq(inflowsTable.id, transactionId))
// 		.limit(1);

// 	if (inflow.length > 0) {
// 		return 'income';
// 	}

// 	const expense = await db
// 		.select({ id: expensesTable.id })
// 		.from(expensesTable)
// 		.where(eq(expensesTable.id, transactionId))
// 		.limit(1);

// 	if (expense.length > 0) {
// 		return 'expense';
// 	}

// 	return null; // Transaction not found
// };

export const getPaginatedTransactions = async (
	page: number,
	pageSize: number,
	projectId: string,
	userId: string
) => {
	const offset = (page - 1) * pageSize;

	try {
		// Fetch all transactions from inflowsTable
		const income = await db
			.select()
			.from(inflowsTable)
			.where(and(eq(inflowsTable.projectId, projectId), eq(inflowsTable.userId, userId)))
			.execute();

		// Fetch all transactions from expensesTable
		const expenses = await db
			.select()
			.from(expensesTable)
			.where(and(eq(expensesTable.projectId, projectId), eq(expensesTable.userId, userId)))
			.execute();

		const project = await db.select().from(projects).where(eq(projects.id, projectId)).execute();

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
			.where(and(eq(inflowsTable.projectId, projectId), eq(inflowsTable.userId, userId)))
			.execute()
			.then((rows) => rows[0]?.count || 0);

		const totalExpensesCount = await db
			.select({
				count: count(expensesTable.id)
			})
			.from(expensesTable)
			.where(and(eq(expensesTable.projectId, projectId), eq(expensesTable.userId, userId)))
			.execute()
			.then((rows) => rows[0]?.count || 0);

		const totalCount = totalIncomeCount + totalExpensesCount;
		const totalPages = Math.ceil(totalCount / pageSize);

		return {
			allTransactions,
			paginatedTransactions,
			project,
			pagination: { page, pageSize, totalCount, totalPages }
		};
	} catch (error) {
		console.error('Error fetching transactions:', error);
		throw new Error('An error occurred while fetching transactions.');
	}
};

// export const sortTransactions = async (ID: string, userId: string) => {
// 	const project = await db.select().from(projects).where(eq(projects.id, ID));
// 	if (!project) {
// 		return new Error('Project not found');
// 	}
// 	try {
// 		const income = await db.query.inflowsTable.findMany({
// 			where: and(eq(inflowsTable.projectId, ID), eq(inflowsTable.userId, userId))
// 		});
// 		const expenses = await db.query.expensesTable.findMany({
// 			where: and(eq(expensesTable.projectId, ID), eq(expensesTable.userId, userId))
// 		});

// 		const incomeWithSource = income.map((entry) => ({ ...entry, type: 'income' }));
// 		const expensesWithSource = expenses.map((entry) => ({ ...entry, type: 'expense' }));
// 		const transactions = [...incomeWithSource, ...expensesWithSource];
// 		const transactionHistory = transactions
// 			.sort((a, b) => {
// 				const createdAtA = a.createdAt !== null ? new Date(a.createdAt).getTime() : 0;
// 				const createdAtB = b.createdAt !== null ? new Date(b.createdAt).getTime() : 0;
// 				return createdAtA - createdAtB;
// 			})
// 			.reverse();
// 			return {
// 				transactionHistory,
// 				ID,
// 				project: project[0],
// 			}
// 	} catch (error) {
// 		return new Error('An error occurred while fetching transactions.');
// 	}
// }
