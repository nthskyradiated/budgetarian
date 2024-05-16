import { type InferSelectModel } from 'drizzle-orm';
import { text, int, sqliteTable } from 'drizzle-orm/sqlite-core';

import projects from './projects';
import expensesCategories from './expensesCategories';

const projectsExpensesCategoriesTable = sqliteTable('projects_expenses_categories', {
	id: int('id').primaryKey().notNull(),
	projectId: text('project_id')
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	categoryId: text('expense_category_id')
		.notNull()
		.references(() => expensesCategories.id, { onDelete: 'cascade' })
});

export default projectsExpensesCategoriesTable;

export type ProjectsExpensesCategories = InferSelectModel<typeof projectsExpensesCategoriesTable>;
