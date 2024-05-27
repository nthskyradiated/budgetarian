import { z } from 'zod';
import * as zodVal from '$lib/zodValidators/zodParams';

export type TransactionType =
	| {
			transactionType: 'income';
			incomeCategories: typeof zodVal.INFLOWS_CATEGORIES;
	  }
	| { transactionType: 'expenses'; expensesCategories: typeof zodVal.EXPENSES_CATEGORIES };

const income = z.object({
	transactionType: z.literal('income'),
	categories: zodVal.INFLOWS_CATEGORIES
});

const expenses = z.object({
	transactionType: z.literal('expenses'),
	categories: zodVal.EXPENSES_CATEGORIES
});

export const TransactionTypeRadioZodSchema = z.object({
	transactionType: z.enum(['income', 'expenses'])
});

// Custom validation function to check for whitespace strings
const noWhitespace = (message: string) =>
	z
		.string()
		.min(zodVal.minNameLen, zodVal.PROJECT_NAME_MIN_ERROR_MESSAGE)
		.max(zodVal.maxNameLen, zodVal.PROJECT_NAME_MAX_ERROR_MESSAGE)
		.refine((value) => value.trim().length > 0, {
			message
		});

export const ProjectZodSchema = z.object({
	id: z.string(),
	name: noWhitespace(zodVal.WHITESPACE_ERROR_MESSAGE),
	details: noWhitespace(zodVal.WHITESPACE_ERROR_MESSAGE),
	startingFunds: z.coerce.number().positive()
});

export type projectZodSchema = z.infer<typeof ProjectZodSchema>;

export const UpdateProjectZodSchema = ProjectZodSchema.extend({
	startingFunds: ProjectZodSchema.shape.startingFunds.optional(),
	name: ProjectZodSchema.shape.name.optional(),
	details: ProjectZodSchema.shape.details.optional()
});

export type updateProjectZodSchema = z.infer<typeof UpdateProjectZodSchema>;

export const TransactionZodSchema = z.object({
	name: z
		.string()
		.min(zodVal.minNameLen, zodVal.NAME_MIN_ERROR_MESSAGE)
		.max(zodVal.maxNameLen, zodVal.NAME_MAX_ERROR_MESSAGE),

	amount: z.coerce.number().positive(),

	isRecurring: z.boolean().default(false),

	transactionType: z.discriminatedUnion('transactionType', [income, expenses]),

	remarks: z.string().max(zodVal.maxRemarksLen)
});

export type transactionZodSchema = z.infer<typeof TransactionZodSchema>;
