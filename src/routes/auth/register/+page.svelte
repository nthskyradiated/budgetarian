<script lang="ts">
	import type { PageData } from './$types';
	import { toast, Toaster } from 'svelte-sonner';
	import { zod } from 'sveltekit-superforms/adapters';
	import { superForm } from 'sveltekit-superforms/client';
	import SubmitButton from '$lib/components/form/SubmitButton.svelte';
	import InputField from '@/lib/components/form/InputField.svelte';
	import { RegisterUserZodSchema } from '@/lib/zodValidators/zodAuthValidation';
	import { route } from '@/lib/router';
	import { maxEmailLen, maxNameLen, maxPwrdLen } from '@/lib/zodValidators/zodParams';
	// import SuperDebug from 'sveltekit-superforms';

	export let data: PageData;

	const { enhance, errors, form, message } = superForm(data.registerUserFormData, {
		taintedMessage: null,
		validators: zod(RegisterUserZodSchema),

		onUpdated: () => {
			if (!$message) return;

			const { alertType, alertText } = $message;

			if (alertType === 'success') {
				toast.success(alertText);
			}

			if (alertType === 'error') {
				toast.error(alertText);
			}
		}
	});
</script>

<!-- <SuperDebug data={$form} /> -->
<Toaster />
<!-- done! do not touch! -->
<div class="mx-4 min-h-96 w-96 space-y-4 sm:mx-auto lg:w-1/3">
	<h1 class="mb-6 text-2xl font-bold leading-none">Register</h1>
	<form
		method="post"
		use:enhance
		class="flex flex-col justify-evenly gap-4"
		action={route('register /auth/register')}
	>
		<InputField
			type="text"
			name="name"
			placeholder="enter your name"
			bind:value={$form.name}
			errorMessage={$errors.name}
			maxlength={maxNameLen}
			label="Name"
		/>

		<InputField
			type="email"
			name="email"
			placeholder="enter email address"
			bind:value={$form.email}
			errorMessage={$errors.email}
			maxlength={maxEmailLen}
			label="Email"
		/>
		<InputField
			type="username"
			name="username"
			placeholder="input your username"
			bind:value={$form.username}
			errorMessage={$errors.username}
			maxlength={maxNameLen}
			label="Username"
		/>

		<InputField
			type="password"
			name="password"
			placeholder="input your password"
			bind:value={$form.password}
			errorMessage={$errors.password}
			maxlength={maxPwrdLen}
			label="Password"
		/>

		<SubmitButton class="w-1/6">Register</SubmitButton>
	</form>
</div>
