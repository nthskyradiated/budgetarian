import type { SuperValidated } from 'sveltekit-superforms';
import type { passwordResetZodSchema } from './zodValidators/zodAuthValidation';
import type {
	projectZodSchema,
	transactionZodSchema,
	updateProjectZodSchema
} from './zodValidators/zodProjectValidation';
import type { HTMLButtonAttributes, HTMLInputAttributes } from 'svelte/elements';
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
	// class?: string | HTMLButtonAttributes['class']
	className?: HTMLButtonAttributes['class'];
	children: Snippet;
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
export type DeleteUserProps = {
	onDeleteUser: () => void;
};

export type InputFieldProps = {
	type: HTMLInputAttributes['type'];
	value: string | number | null | undefined;
	name: string;
	label?: string;
	placeholder?: string;
	spellcheck?: boolean;
	autocomplete?: string;
	enterkeyhint?: EnterKeyHintType;
	maxlength?: number | undefined;
	minlength?: number | undefined;
	errorMessage?: object | undefined;
	className?: HTMLInputAttributes['class'];
	step?: HTMLInputAttributes['step'];
};

export type AlphabetPattern = 'a-z' | 'A-Z' | '0-9' | '-' | '_';

export type TimeSpanUnit = 'ms' | 's' | 'm' | 'h' | 'd' | 'w';

export type TypedArray =
	| Uint8Array
	| Int8Array
	| Uint16Array
	| Int16Array
	| Uint32Array
	| Int32Array
	| Float32Array
	| Float64Array
	| BigInt64Array
	| BigUint64Array;

export class TimeSpan {
	constructor(value: number, unit: TimeSpanUnit) {
		this.value = value;
		this.unit = unit;
	}

	public value: number;
	public unit: TimeSpanUnit;

	public milliseconds(): number {
		if (this.unit === 'ms') {
			return this.value;
		}
		if (this.unit === 's') {
			return this.value * 1000;
		}
		if (this.unit === 'm') {
			return this.value * 1000 * 60;
		}
		if (this.unit === 'h') {
			return this.value * 1000 * 60 * 60;
		}
		if (this.unit === 'd') {
			return this.value * 1000 * 60 * 60 * 24;
		}
		return this.value * 1000 * 60 * 60 * 24 * 7;
	}

	public seconds(): number {
		return this.milliseconds() / 1000;
	}

	public transform(x: number): TimeSpan {
		return new TimeSpan(Math.round(this.milliseconds() * x), 'ms');
	}
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

export interface Session {
	id: string;
	userId: string;
	expiresAt: Date;
}

export interface User {
	id: string;
	email: string;
	username: string | null;
	name: string | null;
	avatarUrl: string | null;
	authMethods: string[];
}