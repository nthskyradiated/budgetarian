<script lang="ts">
	import { route } from '@/lib/router';
	import ThemeToggler from './ThemeToggler.svelte';
	export let user;
</script>

<h1 class="py-10 text-left ml-4">Logged in as: {user.name ?? user.username}</h1>
<nav class="w-80 pr-4 text-xl sm:pr-0 lg:w-96 ml-auto lg:mr-8">
	<ul class="flex justify-end gap-4">
		<li><a href={route('/protected/projects')}><span>Projects</span></a></li>
		<li><a href={route('/protected/dashboard')}><span>Profile</span></a></li>
		<li><a href={route('/auth/logout')}><span>Logout</span></a></li>
		<ThemeToggler />
	</ul>
</nav>
