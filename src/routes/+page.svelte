<script lang="ts">
	import Button from '@/lib/components/ui/button/button.svelte';
	import { goto } from '$app/navigation';
	import { Icons } from '@/lib/components/icons';
	import Icon from '@iconify/svelte';

	let isLoading = false;
</script>

<main class="items-center min-h-96 w-auto mx-auto">
	<div class="flex w-64 flex-col gap-4">
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
				<Icon icon="line-md:github-loop" class="mr-2 h-6 w-6" />
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
				<Icon icon="cbi:google-logo-circle" class="mr-2 h-6 w-6" />
			{/if}
			Continue with Google
		</Button>
	</div>
</main>
