<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils';

	import Button from '../ui/button/button.svelte';
	import type { BtnProps } from '@/lib/types';

	let className: HTMLButtonAttributes['class'];

	let { disabled = false, formaction = null, showSpinner = null, children }: BtnProps = $props();
	export { className as class };
	console.log('className:', className);

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
