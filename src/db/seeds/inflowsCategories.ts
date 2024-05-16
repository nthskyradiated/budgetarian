import type db from '@/db';
import inflowsCategory from './jsondata/expensesCategory.json';
import inflowsCategoriesTable from '../schema/projectsSchema/inflowsCategories';

export default async function seed(db: db) {
	await db.insert(inflowsCategoriesTable).values(inflowsCategory);
}
