<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import SubmitButton from '@/lib/components/form/SubmitButton.svelte';
	import { route } from '@/lib/router';
	import PasswordChangeForm from '@/lib/components/form/PasswordChangeForm.svelte';
	import Card from '@/lib/components/ui/card/card.svelte';
	import { goto } from '$app/navigation';
	let {data} = $props();

	const { loggedInUser, recentProjects } = data;

	const nameInitial = data.user?.name?.charAt(0).toUpperCase();
	const emailInitial = data.user?.email.charAt(0).toUpperCase();
	const isOnlyOauthUser = !loggedInUser.authMethods.includes('email');

	const mySelectionHandler = (event: string) => {
		const ID = event;
		goto(`/protected/project/${ID}`);
	};
</script>

<section class="mx-auto my-12 w-80 gap-4 md:ml-12 md:w-full">
	<div class="flex flex-col gap-8">
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
				<PasswordChangeForm
					formData={data.passwordResetFormData}
					formAction={route('changePassword /dashboard')}
				/>
			{/if}
		</div>
	</div>
</section>
<section class="mx-auto my-12 w-80 gap-4 md:ml-8 md:w-full"></section>
<section class="mx-auto flex w-80 flex-col gap-4 md:ml-12 md:w-full">
	<h1 class="text-2xl">Recently Updated:</h1>
	{#if recentProjects.length === 0}
		<h1 class="mb-5 text-lg">{data.message}</h1>
	{:else}
		{#each recentProjects as project}
			<Card
				class="mx-auto my-2 w-full p-6 sm:mx-3 lg:w-1/3"
				on:click={() => mySelectionHandler(project.id)}
			>
				<div class="flex flex-col gap-4">
					<div class="flex justify-between px-4">
						<span class="font-bold">Project Name: </span>
						<p class="inline text-right">{project?.name}</p>
					</div>
					<div class="flex justify-between px-4">
						<span class="font-bold">Project Details: </span>
						<p class="inline text-right">{project?.details}</p>
					</div>
					<div class="flex justify-between px-4">
						<span class="font-bold">Current Balance: </span>
						<p class="inline text-right">{project?.totalFunds}</p>
					</div>
					<div class="flex justify-between px-4">
						<span class="font-bold">Last Updated: </span>
						<p class="inline text-right">{project?.updatedAt}</p>
					</div>
				</div>
			</Card>
		{/each}
	{/if}
</section>
