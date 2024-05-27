<script lang="ts">
	import { route } from '@/lib/router';
	import ThemeToggler from './ThemeToggler.svelte';
</script>

<nav class="mx-auto w-96 text-right text-xl md:w-full">
	<ul class="flex justify-end lg:gap-4">
		<li><a href={route('/protected/projects')}><span>Projects</span></a></li>
		<li><a href={route('/protected/dashboard')}><span>Profile</span></a></li>
		<li><a href={route('/auth/logout')}><span>Logout</span></a></li>
		<ThemeToggler />
	</ul>
</nav>
