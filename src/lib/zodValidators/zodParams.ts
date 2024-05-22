import { z } from 'zod';

export const minNameLen = 1;
export const maxNameLen = 50;
export const maxEmailLen = 254;
export const maxRemarksLen = 254;
export const minPwrdLen = 8;
export const maxPwrdLen = 128;
export const pwrdChars = '@$!%*?&';
export const emailVerificationCodeLen = 8;

export const NAME_MIN_ERROR_MESSAGE = `Name must be at least ${minNameLen} characters long`;
export const NAME_MAX_ERROR_MESSAGE = `Name must be less than ${maxNameLen} characters long`;
export const EMAIL_MAX_ERROR_MESSAGE = `Email must be less than ${maxEmailLen} characters long`;
export const PASSWORD_MIN_ERROR_MESSAGE = `Password must be at least ${minPwrdLen} characters long`;
export const PASSWORD_MAX_ERROR_MESSAGE = `Password must be less than ${maxPwrdLen} characters long`;
export const PASSWORD_SPECIAL_CHARS_MESSAGE = ` Requires a special character: (${pwrdChars.split('').join(', ')})`;

export const PROJECT_NAME_MIN_ERROR_MESSAGE = `Project name must be at least ${minNameLen} characters long`;
export const PROJECT_NAME_MAX_ERROR_MESSAGE = `Project name must be less than ${maxNameLen} characters long`;

export const EXPENSES_CATEGORIES = z.enum([
	'Utilities',
	'Food',
	'Groceries',
	'Health expenses',
	'Loan Payments',
	'emergency expenses',
	'Transport expenses',
	'Medical expenses',
	'Entertainment',
	'Other'
]);
export const INFLOWS_CATEGORIES = z.enum([
	'Salary',
	'Bonus',
	'Allowances',
	'Pension',
	'Dividends',
	'Service Payments',
	'Credits and Reimbursements',
	'Other'
]);
