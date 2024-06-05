import type { SuperValidated } from 'sveltekit-superforms';
import type { passwordResetZodSchema } from './zodValidators/zodAuthValidation';
import type {
	projectZodSchema,
	transactionZodSchema,
	updateProjectZodSchema
} from './zodValidators/zodProjectValidation';
import type { HTMLButtonAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

export type AlertMessageType = {
	alertType: 'success' | 'error' | 'warning' | 'info';
	alertText: string;
};

export type EnterKeyHintType =
	| 'search'
	| 'enter'
	| 'done'
	| 'go'
	| 'next'
	| 'previous'
	| 'send'
	| null
	| undefined;

// Type for prettifying an object type
export type PrettifyType<T> = {
	[K in keyof T]: T[K];
} & Record<string, never>;

export type EmailParams = {
	email: string;
	subject: string;
	htmlContent: string;
};

export type PendingVerificationUserDataType = {
	id: string;
	email: string;
};

export type GitHubUser = {
	id: number;
	login: string;
	avatar_url: string;
	name: string;
};

export type GitHubEmail = {
	email: string;
	primary: boolean;
	verified: boolean;
	visibility: string | null;
};

export type GoogleUser = {
	sub: string;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
	email: string;
	email_verified: boolean;
	locale: string;
};

export type Project = {
	id: number;
	name: string;
	details: string;
	totalFunds: number | undefined;
	createdAt: string | null;
	updatedAt: string | null;
	userId: string;
};

export type TransactionType = 'income' | 'expense';

export type Transaction = {
	type: string;
	name: string;
	id: string;
	createdAt: string | null;
	userId: string;
	category: number;
	amount: number;
	remarks: string | null;
	updatedAt: string | null;
	projectId: string;
	isRecurring: boolean;
};

export type BtnProps = {
	disabled?: boolean;
	formaction?: string | null;
	showSpinner?: boolean | null;
	class?: string | HTMLButtonAttributes['class']
	children: Snippet
};

export type PasswordChangeFormProps = {
	formData: SuperValidated<passwordResetZodSchema>;
	isPasswordResetTokenRequired?: boolean;
	formAction: string;
};

export type TransactionFormProps = {
	formData: SuperValidated<transactionZodSchema>;
	formAction: string;
	dialogTitle: string;
	dialogTriggerBtn: string;
	dialogDescription: string;
	dialogSubmitBtn: string;
	onAddTransaction: () => void;
};

export type UpdateProjectFormProps = {
	updateProjectFormData: SuperValidated<updateProjectZodSchema>;
	updateProjectFormAction: string;
	dialogName: string;
	dialogTitle: string;
	dialogDescription: string;
	projectId: string;
	updateFundsPlaceHolder: number;
	nameDefaultVal: string;
	detailsDefaultVal: string;
};

export type CreateProjectFormProps = {
	createProjectFormData: SuperValidated<projectZodSchema>;
	createProjectFormAction: string;
	dialogName: string;
	dialogTitle: string;
	dialogDescription: string;
};

export type TransactionPaginatorProps = {
	count: number;
	perPage: number;
	onPageChange: (newPage: number) => void;
};

export type DeleteTransactionProps = {
	ID: string;
	transactionId: string;
	onDeleteTransaction: (transactionId: string, ID: string) => void;
};

export type DeleteProjectProps = {
	projectId: string;
	onDeleteProject: (projectId: string) => void;
};
