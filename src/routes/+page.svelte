<script lang="ts">
	import Button from '@/lib/components/ui/button/button.svelte';
	import { goto } from '$app/navigation';
	import { Icons } from '@/lib/components/icons';

	let isLoading = false;
</script>

<main class="align-center mx-4 min-h-96 w-96 sm:mx-auto">
	<div class="mx-auto flex w-64 flex-col gap-4">
		<Button
			type="button"
			on:click={() => {
				goto('auth/login');
			}}>Log in with Email</Button
		>
		<Button
			type="button"
			on:click={() => {
				goto('auth/register');
			}}>Register</Button
		>
		<div class="flex items-center">
			<div class="mr-3 flex-grow border-t border-gray-500"></div>
			<div>Or</div>
			<div class="ml-3 flex-grow border-t border-gray-500"></div>
		</div>
		<Button
			variant="outline"
			type="button"
			disabled={isLoading}
			on:click={() => {
				goto('/auth/github');
			}}
		>
			{#if isLoading}
				<Icons.spinner class="mr-2 h-4 w-4 animate-spin" />
			{:else}
				<Icons.gitHub class="mr-2 h-4 w-4" />
			{/if}
			Continue with GitHub
		</Button>
		<Button
			variant="outline"
			type="button"
			disabled={isLoading}
			on:click={() => {
				goto('/auth/google');
			}}
		>
			{#if isLoading}
				<Icons.spinner class="mr-2 h-4 w-4 animate-spin" />
			{:else}
				<Icons.google class="mr-2 h-4 w-4" />
			{/if}
			Continue with Google
		</Button>
	</div>
</main>
