import type db from '@/db';
import expensesCategory from './jsondata/expensesCategory.json';
import expensesCategoriesTable from '../schema/fundsSchema/expensesCategories';

export default async function seed(db: db) {
	await db.insert(expensesCategoriesTable).values(expensesCategory);
}
