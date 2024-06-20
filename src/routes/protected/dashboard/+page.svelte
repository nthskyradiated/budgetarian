<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	// import SubmitButton from '@/lib/components/form/SubmitButton.svelte';
	import { route } from '@/lib/router';
	import PasswordChangeForm from '@/lib/components/form/PasswordChangeForm.svelte';
	import Card from '@/lib/components/ui/card/card.svelte';
	import { goto } from '$app/navigation';
	import DeleteUser from '@/lib/components/DeleteUser.svelte';
	import { toast } from 'svelte-sonner';
	let { data } = $props();

	const { loggedInUser, recentProjects } = data;

	const nameInitial = data.user?.name?.charAt(0).toUpperCase();
	const emailInitial = data.user?.email.charAt(0).toUpperCase();
	const isOnlyOauthUser = !loggedInUser.authMethods.includes('email');

	const mySelectionHandler = (event: string) => {
		const ID = event;
		goto(`/protected/project/${ID}`);
	};

	const handleDeleteUser = async () => {
		const response = await fetch('/protected/dashboard', {
			method: 'DELETE'
		});

		if (response.ok) {
			goto('/');
			toast.success('Deleted Your Account successfully');
		} else {
			toast.error('Failed to delete Account');
		}
	};
</script>

<section class="mx-auto my-12 w-80 gap-4 md:ml-12 md:w-full">
	<div class="flex w-1/2 flex-col gap-8">
		<h1 class="mb-5 text-2xl">
			<span class="font-bold"
				>{loggedInUser.name || loggedInUser.username || loggedInUser.email}'s Dashboard</span
			>
		</h1>
		<div class="flex flex-row items-center gap-16 align-middle">
			<Avatar.Root class="size-20">
				<Avatar.Image src={data.user?.avatarUrl} alt="User Avatar" />
				<Avatar.Fallback class="text-5xl">
					{nameInitial || emailInitial}
				</Avatar.Fallback>
			</Avatar.Root>
			<div class="mt-8 flex w-auto flex-col items-center gap-2 align-middle">
				<DeleteUser onDeleteUser={handleDeleteUser} />
				{#if isOnlyOauthUser === false}
					<PasswordChangeForm
						formData={data.passwordResetFormData}
						formAction={route('changePassword /dashboard')}
					/>
				{/if}
			</div>
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
				onclick={() => mySelectionHandler(project.id)}
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
