<script lang="ts">
	import Button from '@/lib/components/ui/button/button.svelte';
	import { goto } from '$app/navigation';
</script>

<header class='w-full mb-10 text-start my-12'>
	<h1>Welcome to Handshakes.me VIP</h1>
	<p>Visit <a href="https://handshakes.me">Handshakes.me</a> to learn more.</p>
</header>

<main class="flex flex-row justify-evenly align-center w-auto m-auto">
<div class="flex flex-col gap-4 w-64 mx-auto">
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
<Button
	type="button"
	on:click={() => {
		goto('/auth/github');
	}}>Continue with Github</Button
>
<Button
	type="button"
	on:click={() => {
		goto('/auth/google');
	}}>Continue with Google</Button
>
</div>
</main>