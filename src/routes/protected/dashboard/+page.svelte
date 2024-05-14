<script lang="ts">
	import type { PageData } from './$types';
	import * as Avatar from '$lib/components/ui/avatar';
	import { buttonVariants } from '@/lib/components/ui/button';
	import SubmitButton from '@/lib/components/form/SubmitButton.svelte';
	import * as Dialog from '@/lib/components/ui/dialog';
	import { route } from '@/lib/router';
	import PasswordResetForm from '@/lib/components/form/PasswordResetForm.svelte';
	export let data: PageData;

	const { loggedInUser } = data;

	const nameInitial = data.user?.name?.charAt(0).toUpperCase();
	const emailInitial = data.user?.email.charAt(0).toUpperCase();
	const isOnlyOauthUser = !loggedInUser.authMethods.includes('email');
</script>

<section class="flex flex-wrap items-center gap-4">
	<div>
		<h1 class="mb-5 text-2xl">
			<span class="font-bold"
				>{loggedInUser.name || loggedInUser.username || loggedInUser.email}'s Dashboard</span
			>
		</h1>
		<Avatar.Root class="size-20">
			<Avatar.Image src={data.user?.avatarUrl} alt="User Avatar" />
			<Avatar.Fallback class="text-5xl">
				{nameInitial || emailInitial}
			</Avatar.Fallback>
		</Avatar.Root>
		<div class="flex gap-2">
			<form method="post" action={route('logout /dashboard')}>
				<SubmitButton>Logout</SubmitButton>
			</form>

			{#if isOnlyOauthUser === false}
				<Dialog.Root>
					<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>
						Change Password
					</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Password Change</Dialog.Title>
							<Dialog.Description>Please enter your new password.</Dialog.Description>
						</Dialog.Header>

						<PasswordResetForm
							formData={data.passwordResetFormData}
							formAction={route('changePassword /dashboard')}
						/>
					</Dialog.Content>
				</Dialog.Root>
			{/if}
		</div>
	</div>
</section>
