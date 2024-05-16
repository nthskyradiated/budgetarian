import { type InferSelectModel } from 'drizzle-orm';
import { text, int, sqliteTable } from 'drizzle-orm/sqlite-core';

import projects from './projects';
import inflowsCategories from './inflowsCategories';

const projectsInflowsCategoriesTable = sqliteTable('projects_inflows_categories', {
	id: int('id').primaryKey().notNull(),
	projectId: text('project_id')
		.notNull()
		.references(() => projects.id, { onDelete: 'cascade' }),
	categoryId: text('inflow_category_id')
		.notNull()
		.references(() => inflowsCategories.id, { onDelete: 'cascade' })
});

export default projectsInflowsCategoriesTable;

export type ProjectsInflowsCategories = InferSelectModel<typeof projectsInflowsCategoriesTable>;
