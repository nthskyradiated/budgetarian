<script lang="ts">
	import { resetMode, setMode } from 'mode-watcher';
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	let { side }: { side: 'top' | 'right' | 'bottom' | 'left' } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" size="icon" class="text-2xl">
			<Icon icon="line-md:sun-rising-loop" class="dark:hidden" />
			<Icon icon="line-md:moon-rising-loop" class="hidden dark:block" />

			<span class="sr-only">Toggle theme</span>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content {side} class="dark:bg-inherit">
		<DropdownMenu.Item onclick={() => setMode('light')}>Light</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => setMode('dark')}>Dark</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => resetMode()}>System</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
