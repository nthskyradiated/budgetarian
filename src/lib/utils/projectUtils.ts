import db from "@/db";
import { projectsTable } from "@/db/schema";
import type { ProjectInsertSchema } from "@/db/schema/projectsSchema/projects";
import projects from "@/db/schema/projectsSchema/projects";
import { eq } from 'drizzle-orm';

export const insertNewProject = async (project: ProjectInsertSchema) => {
	return await db.insert(projectsTable).values(project);
};

export const getAllProjects = async (id: string) => {
	await db.select().from(projects).where(eq(projects.userId, id))
}