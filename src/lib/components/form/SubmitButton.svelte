<script lang="ts">
	import { cn } from '$lib/utils';
	import Button from '../ui/button/button.svelte';
	import type { BtnProps } from '@/lib/types';

	let {
		disabled = false,
		formaction = null,
		showSpinner = null,
		children,
		className
	}: BtnProps = $props();
</script>

<Button
	{disabled}
	{formaction}
	type="submit"
	aria-disabled={disabled}
	class={cn('gap-2 font-bold', className)}
>
	{#if showSpinner === null ? disabled : showSpinner}
		<iconify-icon icon="eos-icons:bubble-loading"></iconify-icon>
	{/if}

	{@render children()}
</Button>
