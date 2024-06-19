<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms/client';
	import { route } from '$lib/router';
	import {
		UserLoginZodSchema,
		PasswordResetEmailZodSchema
	} from '$lib/zodValidators/zodAuthValidation';
	import { maxEmailLen, maxPwrdLen } from '$lib/zodValidators/zodParams';
	import * as Dialog from '$lib/components/ui/dialog';
	import InputField from '@/lib/components/form/InputField.svelte';
	import { buttonVariants } from '@/lib/components/ui/button';
	import SubmitButton from '@/lib/components/form/SubmitButton.svelte';
	import { zod } from 'sveltekit-superforms/adapters';

	let { data } = $props();
	let open = $state(false);

	// For login form
	const {
		enhance: loginEnhance,
		form: loginForm,
		errors: loginErrors,
		message: loginMessage,
		delayed: loginDelayed
	} = superForm(data.userLoginFormData, {
		resetForm: true,
		taintedMessage: null,
		validators: zod(UserLoginZodSchema),

		onUpdated: () => {
			if (!$loginMessage) return;

			const { alertType, alertText } = $loginMessage;

			if (alertType === 'error') {
				toast.error(alertText);
			}
		}
	});

	// For password reset form
	const {
		enhance: resetEnhance,
		form: resetForm,
		errors: resetErrors,
		message: resetMessage,
		delayed: resetDelayed
	} = superForm(data.passwordResetEmailFormData, {
		resetForm: true,
		taintedMessage: null,
		validators: zod(PasswordResetEmailZodSchema),
		onUpdate: (resetForm) => {
			if (resetForm.result?.type === 'success') {
				open = false;
			}
		},

		onUpdated: () => {
			if (!$resetMessage) return;

			const { alertType, alertText } = $resetMessage;

			if (alertType === 'error') {
				toast.error(alertText);
			}

			if (alertType === 'success') {
				toast.success(alertText);
			}
		}
	});
</script>

<!-- done. do not touch! -->
<div class=" mx-auto min-h-96 w-80 space-y-4 lg:w-1/3">
	<h1 class="mb-6 text-2xl font-bold leading-none">Login</h1>

	<form method="post" use:loginEnhance action={route('logIn /auth/login')} class="space-y-4">
		<InputField
			type="email"
			name="email"
			label="Email"
			bind:value={$loginForm.email}
			errorMessage={$loginErrors.email}
			maxlength={maxEmailLen}
		/>

		<InputField
			type="password"
			name="password"
			label="Password"
			bind:value={$loginForm.password}
			errorMessage={$loginErrors.password}
			maxlength={maxPwrdLen}
		/>

		<div class="flex flex-col justify-between gap-4 sm:flex-initial sm:flex-row sm:flex-wrap">
			<SubmitButton disabled={$loginDelayed} className="flex-grow"
				>Login in with your email</SubmitButton
			>

			<Dialog.Root bind:open>
				<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>
					Forgot Password?
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Password Reset</Dialog.Title>
						<Dialog.Description>
							Enter your email address and we'll send you a link to reset your password.
						</Dialog.Description>
					</Dialog.Header>

					<form
						method="post"
						use:resetEnhance
						action={route('sendPasswordResetEmail /auth/login')}
						class="space-y-4"
					>
						<InputField
							type="email"
							name="email"
							label="Email"
							bind:value={$resetForm.email}
							errorMessage={$resetErrors.email}
							maxlength={maxEmailLen}
						/>

						<SubmitButton disabled={$resetDelayed}>Send Reset Link</SubmitButton>
					</form>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	</form>
</div>
