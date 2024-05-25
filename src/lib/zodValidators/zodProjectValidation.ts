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

export const ProjectZodSchema = z.object({
	id: z.string(),
	name: z
		.string()
		.min(zodVal.minNameLen, zodVal.NAME_MIN_ERROR_MESSAGE)
		.max(zodVal.maxNameLen, zodVal.NAME_MAX_ERROR_MESSAGE),

	details: z
		.string()
		.min(zodVal.minNameLen, zodVal.NAME_MIN_ERROR_MESSAGE)
		.max(zodVal.maxNameLen, zodVal.NAME_MAX_ERROR_MESSAGE),
	startingFunds: z.coerce.number().positive()
});

export type projectZodSchema = z.infer<typeof ProjectZodSchema>;


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
