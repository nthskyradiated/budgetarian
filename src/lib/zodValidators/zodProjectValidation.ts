import { z } from 'zod';
import * as zodVal from '$lib/zodValidators/zodParams';


export const CreateProjectZodSchema = z.object({
	name: z
		.string(),

	details: z
		.string(),
	totalFunds: z
		.string()
});


export type createProjectZodSchema = z.infer<typeof CreateProjectZodSchema>;``