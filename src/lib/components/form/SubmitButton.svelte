<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils';

	import Button from '../ui/button/button.svelte';
	import type { BtnProps } from '@/lib/types';

	let className: HTMLButtonAttributes['class'] = undefined;

	export { className as class };

	let { disabled = false, formaction = null, showSpinner = null, class}: BtnProps = $props();
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

	<!-- svelte-ignore slot_element_deprecated -->
	<span>
		<slot>Submit</slot>
	</span>
</Button>
