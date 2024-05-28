<script lang="ts">
	import { route } from '@/lib/router';
	import ThemeToggler from './ThemeToggler.svelte';
	export let user;
</script>

<h1 class="py-10 text-left">Logged in as: {user.name ?? user.username}</h1>
<nav class="w-11/12 pr-4 text-right text-xl sm:mx-auto sm:pr-0 md:w-full">
	<ul class="flex justify-end gap-4">
		<li><a href={route('/protected/projects')}><span>Projects</span></a></li>
		<li><a href={route('/protected/dashboard')}><span>Profile</span></a></li>
		<li><a href={route('/auth/logout')}><span>Logout</span></a></li>
		<ThemeToggler />
	</ul>
</nav>
