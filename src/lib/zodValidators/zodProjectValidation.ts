import { z } from 'zod';
import * as zodVal from '$lib/zodValidators/zodParams';


export const CreateProjectZodSchema = z.object({
	name: z
		.string()
		.min(zodVal.minNameLen, zodVal.PROJECT_NAME_MIN_ERROR_MESSAGE)
		.max(zodVal.maxNameLen, zodVal.PROJECT_NAME_MAX_ERROR_MESSAGE),
	details: z
		.string(),
	totalFunds: z
		.string()
		.min(zodVal.minNameLen, zodVal.PROJECT_NAME_MIN_ERROR_MESSAGE)
		.max(zodVal.maxNameLen, zodVal.PROJECT_NAME_MAX_ERROR_MESSAGE),
});


export type createProjectZodSchema = z.infer<typeof CreateProjectZodSchema>;``