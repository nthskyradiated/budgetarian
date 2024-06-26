<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast, Toaster } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms/client';
	import { zod } from 'sveltekit-superforms/adapters';
	import { route } from '@/lib/router';
	// import Input from "@/lib/components/ui/input/input.svelte";
	// import Button from "@/lib/components/ui/button/button.svelte";
	import { EmailVerificationCodeZodSchema } from '@/lib/zodValidators/zodAuthValidation';
	import InputField from '@/lib/components/form/InputField.svelte';
	import SubmitButton from '@/lib/components/form/SubmitButton.svelte';

	let { data } = $props();

	const {
		form,
		errors,
		message,
		delayed,
		enhance: verifyCodeEnhance
	} = superForm(data.emailVerificationCodeFormData, {
		resetForm: false,
		taintedMessage: null,
		validators: zod(EmailVerificationCodeZodSchema),

		onUpdated: () => {
			if (!message) return;
			const { alertType, alertText } = $message;

			if (alertType === 'error') {
				toast.error(alertText);
			}
		}
	});
</script>

<Toaster />

<!-- done. do not touch! -->
<div class="mx-auto min-h-96 w-80 items-center space-y-4 lg:w-1/3">
	<h1 class="mb-6 text-2xl font-bold leading-none">Email Verification Code</h1>

	<h2 class="mb-5">
		Welcome aboard 🎉! To complete your registration, please enter the verification code we've sent
		to your email:
		<strong>{data.pendingUserEmail}</strong>.
	</h2>

	<form
		action={route('verifyCode /auth/email-verification')}
		method="post"
		class="space-y-6"
		use:verifyCodeEnhance
	>
		<InputField
			type="text"
			name="verificationCode"
			label="Verification Code"
			placeholder="Enter your verification code here"
			bind:value={$form.verificationCode}
			errorMessage={$errors.verificationCode}
		/>

		<SubmitButton className="w-full" disabled={$delayed}>Verify</SubmitButton>
	</form>

	<form
		method="post"
		action={route('sendNewCode /auth/email-verification')}
		use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'failure') {
					toast.error((result.data?.['message'] || '').toString());
				}

				if (result.type === 'success') {
					toast.success((result.data?.['message'] || '').toString());
				}
			};
		}}
		class="mt-4"
	>
		<SubmitButton className="w-full">Send New Code</SubmitButton>
	</form>
</div>
