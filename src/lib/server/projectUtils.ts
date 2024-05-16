import db from "@/db";
import { projectsTable } from "@/db/schema";
import type { ProjectInsertSchema } from "@/db/schema/projectsSchema/projects";

export const insertNewProject = async (project: ProjectInsertSchema) => {
	return await db.insert(projectsTable).values(project);
};