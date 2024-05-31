<script lang="ts">
	import type { PageData } from './$types';

	import { route } from '$lib/router';
	import { Button } from '$lib/components/ui/button/index';
	import PasswordChangeForm from '@/lib/components/form/PasswordChangeForm.svelte';

	export let data: PageData;
</script>

<div
	class="mx-auto flex min-h-96 w-80 flex-col items-center justify-start space-y-4 text-center lg:w-1/3"
>
	{#if data.passwordResetTokenStatus.isValid === false}
		<h1 class="mb-5 text-2xl font-bold text-red-600">
			{data.passwordResetTokenStatus.message}
		</h1>

		<Button href={route('/auth/login')}>Return to Login Page to Request a New Code</Button>
	{:else}
		<h1 class="mb-6 text-2xl font-bold leading-none">Reset Password</h1>

		<PasswordChangeForm
			formData={data.passwordResetFormData}
			formAction={route('resetPassword /auth/reset-password')}
			isPasswordResetTokenRequired={true}
		/>
	{/if}
</div>
