<script lang="ts">
	import { route } from '@/lib/router';
	import ThemeToggler from './ThemeToggler.svelte';
	import type { User } from 'lucia';
	import * as DropdownMenu from './ui/dropdown-menu';
	import Button from './ui/button/button.svelte';
	let { user } = $props<{ user: User }>();
</script>

<div class="flex flex-row items-end justify-evenly">


	<h1 class="ml-4 py-10 text-left">Logged in as: {user.name ?? user.username}</h1>
	<nav class="ml-auto block pr-8 sm:hidden">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button builders={[builder]} variant="outline" size="sm" class="px-2 text-xl">
					<span>Menu</span>
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content side="bottom" class="dark:bg-inherit">
				<DropdownMenu.Item href={route('/protected/projects')}>Projects</DropdownMenu.Item>
				<DropdownMenu.Item href={route('/protected/dashboard')}>Profile</DropdownMenu.Item>
				<DropdownMenu.Item href={route('/auth/logout')} class="pb-4">Logout</DropdownMenu.Item>
				<ThemeToggler side="left"/>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</nav>
	<nav class="ml-auto hidden sm:block w-80 pr-4 text-xl sm:pr-0 lg:mr-8 lg:w-96">
		<ul class="flex justify-end gap-4">
			<li><a href={route('/protected/projects')}><span>Projects</span></a></li>
			<li><a href={route('/protected/dashboard')}><span>Profile</span></a></li>
			<li><a href={route('/auth/logout')}><span>Logout</span></a></li>
			<ThemeToggler side="bottom" />
		</ul>
	</nav>
</div>
