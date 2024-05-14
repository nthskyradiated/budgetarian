<script lang="ts">
	import Button from '@/lib/components/ui/button/button.svelte';
	import { goto } from '$app/navigation';
</script>

<h1>Welcome to Handshakes.me VIP</h1>
<p>Visit <a href="https://handshakes.me">Handshakes.me</a> to learn more.</p>

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
