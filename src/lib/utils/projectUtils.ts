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
