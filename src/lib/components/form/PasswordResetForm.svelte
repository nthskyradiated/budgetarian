<script lang="ts">
	import { page } from '$app/stores';

	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms/client';

	import {
		PasswordResetZodSchema,
		type passwordResetZodSchema
	} from '@/lib/zodValidators/zodAuthValidation';
	import { maxPwrdLen } from '@/lib/zodValidators/zodParams';

	import InputField from './InputField.svelte';
	import SubmitButton from './SubmitButton.svelte';
	import { zod } from 'sveltekit-superforms/adapters';

	export let formData: SuperValidated<passwordResetZodSchema>;
	export let formAction: string;
	export let isPasswordResetTokenRequired: boolean = false;

	const { enhance, form, errors, message, delayed } = superForm(formData, {
		resetForm: true,
		taintedMessage: null,
		validators: zod(PasswordResetZodSchema),

		onUpdated: () => {
			if (!$message) return;

			const { alertType, alertText } = $message;

			if (alertType === 'error') {
				toast.error(alertText);
			}

			if (alertType === 'success') {
				toast.success(alertText);
			}
		}
	});
</script>

<form use:enhance method="post" class="space-y-4" action={formAction}>
	<InputField
		type="password"
		name="newPassword"
		label="New Password"
		bind:value={$form.newPassword}
		errorMessage={$errors.newPassword}
		maxlength={maxPwrdLen}
	/>

	<InputField
		type="password"
		name="confirmPassword"
		label="Confirm Password"
		bind:value={$form.confirmPassword}
		errorMessage={$errors.confirmPassword}
		maxlength={maxPwrdLen}
	/>

	{#if isPasswordResetTokenRequired}
		<InputField
			type="hidden"
			name="passwordResetToken"
			value={$page.url.searchParams.get('token')}
		/>
	{/if}

	<SubmitButton disabled={$delayed} />
</form>
