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
import { eq } from 'drizzle-orm';

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

	console.log(type, category);
	console.log('table....', table);
	const result = await db.select().from(table).where(eq(table.name, category));
	console.log('result', result);
	if (result.length > 0) {
		console.log('this function ran', result);
		return result[0]?.id;
	}
	return null;
};

export const getTransactionType = async (transactionId: string) => {
	const inflow = await db
		.select({ id: inflowsTable.id })
		.from(inflowsTable)
		.where(eq(inflowsTable.id, transactionId))
		.limit(1);

	if (inflow.length > 0) {
		return 'income';
	}

	const expense = await db
		.select({ id: expensesTable.id })
		.from(expensesTable)
		.where(eq(expensesTable.id, transactionId))
		.limit(1);

	if (expense.length > 0) {
		return 'expense';
	}

	return null; // Transaction not found
};
