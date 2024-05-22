import db from '@/db';
import { expensesTable, inflowsTable, projectsTable } from '@/db/schema';
import type { ExpenseInsertSchema } from '@/db/schema/projectsSchema/expenses';
import type { InflowInsertSchema } from '@/db/schema/projectsSchema/inflows';
import type { ProjectInsertSchema } from '@/db/schema/projectsSchema/projects';
import projects from '@/db/schema/projectsSchema/projects';
import { eq } from 'drizzle-orm';

export const insertNewProject = async (project: ProjectInsertSchema) => {
	return await db.insert(projectsTable).values(project).returning();
};

export const getAllProjects = async (id: string) => {
	return await db.select().from(projects).where(eq(projects.userId, id));
};

export const insertNewInflow = async (transaction: InflowInsertSchema) => {
	return await db.insert(inflowsTable).values(transaction).returning();
};
export const insertNewExpense = async (transaction: ExpenseInsertSchema) => {
	return await db.insert(expensesTable).values(transaction).returning();
};

// export const income = await db.query.inflowsTable.findMany({
// 	where: and(
// 		eq(inflowsTable.projectId, ID),
// 		eq(inflowsTable.userId, locals.user.id))
// })
// const expenses = await db.query.expensesTable.findMany({
// 	where: and(
// 		eq(expensesTable.projectId, ID),
// 		eq(expensesTable.userId, locals.user.id))
// })

// const incomeWithSource = income.map(entry => ({ ...entry, type: 'income' }));
// const expensesWithSource = expenses.map(entry => ({ ...entry, type: 'expense' }));
// const transactions = [...incomeWithSource, ...expensesWithSource];
// const transactionHistory = transactions.sort((a, b) => {
// 	const createdAtA = a.createdAt !== null ? new Date(a.createdAt).getTime() : 0;
// 	  const createdAtB = b.createdAt !== null ? new Date(b.createdAt).getTime() : 0;
// 	return createdAtA - createdAtB;
//   }).reverse();
