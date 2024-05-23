import db from '@/db';
import { expensesTable, inflowsTable, projectsTable, inflowsCategoriesTable, expensesCategoriesTable } from '@/db/schema';
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

export const deleteProject = async (id: string) => {
	return await db.delete(projects).where(eq(projects.id, id))
}

export const insertNewInflow = async (transaction: InflowInsertSchema) => {
	return await db.insert(inflowsTable).values(transaction).returning();
};
export const insertNewExpense = async (transaction: ExpenseInsertSchema) => {
	return await db.insert(expensesTable).values(transaction).returning();
};
export const deleteInflow = async (id: string) => {
	return await db.delete(inflowsTable).where(eq(inflowsTable.id, id));
}
export const deleteExpense = async (id: string) => {
	return await db.delete(expensesTable).where(eq(expensesTable.id, id));
}




export const validateCategory = async (category: string, type: 'income' | 'expenses') => {
	const table = type === 'income' ? inflowsCategoriesTable : expensesCategoriesTable;

	console.log(type, category);
	console.log('table....', table);
	const result = await db
		.select()
		.from(table)
		.where(eq(table.name, category))
		console.log('result', result);
		if (result.length > 0) {
			console.log('this function ran', result);
			return result[0]?.id
		}
		return null;
	
}

// export const getCategoryIdByName = async (categoryName: string): Promise<number | null> => {
//     const category = await db.select()
//         .from(inflowsCategoriesTable)
//         .where(inflowsCategoriesTable.name.eq(categoryName))
//         .limit(1)

//     return category.length ? category[0].id : null;
// }



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
