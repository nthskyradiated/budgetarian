<script lang="ts">
	import { route } from '@/lib/router';
	import ThemeToggler from './ThemeToggler.svelte';
	import type { User } from 'lucia';
	let {user} = $props<{user: User}>()

</script>

<h1 class="ml-4 py-10 text-left">Logged in as: {user.name ?? user.username}</h1>
<nav class="ml-auto w-80 pr-4 text-xl sm:pr-0 lg:mr-8 lg:w-96">
	<ul class="flex justify-end gap-4">
		<li><a href={route('/protected/projects')}><span>Projects</span></a></li>
		<li><a href={route('/protected/dashboard')}><span>Profile</span></a></li>
		<li><a href={route('/auth/logout')}><span>Logout</span></a></li>
		<ThemeToggler />
	</ul>
</nav>
