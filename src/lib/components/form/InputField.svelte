<script lang="ts">

	import type {  InputFieldProps } from '$lib/types';
	import { cn } from '$lib/utils';

	// export { className as class };

	let { value = $bindable(), className, type, label, step, name = '', placeholder = '', spellcheck = true, autocomplete = 'on', enterkeyhint = 'next', maxlength = undefined, minlength = undefined, errorMessage = undefined} : InputFieldProps = $props()

	let valueLength = $derived(value?.toString().length);
</script>

<label
	class="grid gap-1 text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
>
	<div>
		<span>{label}</span>

		{#if maxlength}
			<span class="text-xs text-muted-foreground">
				{valueLength}/{maxlength}
			</span>
		{/if}
	</div>

	{#if errorMessage}
		<p class="text-red-500">{errorMessage}</p>
	{/if}

		<input
		{name}
		{...{ type }}
		dir="auto"
		bind:value
		{maxlength}
		{minlength}
		{spellcheck}
		{placeholder}
		{autocomplete}
		{enterkeyhint}
		{step}
		aria-label={label}
		class={cn('rounded border bg-transparent px-3 py-2', className)}
		aria-invalid={errorMessage ? 'true' : undefined}
		/>
	</label>
	
	<!-- {...$$restProps} -->