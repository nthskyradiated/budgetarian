import { z } from 'zod';
import * as zodVal from '$lib/zodValidators/zodParams';


export const CreateProjectZodSchema = z.object({
	name: z
		.string()
		.min(zodVal.minNameLen, zodVal.NAME_MIN_ERROR_MESSAGE)
		.max(zodVal.maxNameLen, zodVal.NAME_MAX_ERROR_MESSAGE),

	details: z
		.string()
		.min(zodVal.minNameLen, zodVal.NAME_MIN_ERROR_MESSAGE)
		.max(zodVal.maxNameLen, zodVal.NAME_MAX_ERROR_MESSAGE),
	totalFunds: z
		.coerce.number().positive()
});


export type createProjectZodSchema = z.infer<typeof CreateProjectZodSchema>;