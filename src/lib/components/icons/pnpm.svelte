<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	interface Props {
		[key: string]: any
	}

	let { ...rest }: Props = $props();

	type $$Props = SVGAttributes<SVGElement>;
</script>

<svg viewBox="0 0 24 24" {...rest}>
	<path
		d="M0 0v7.5h7.5V0zm8.25 0v7.5h7.498V0zm8.25 0v7.5H24V0zM8.25 8.25v7.5h7.498v-7.5zm8.25 0v7.5H24v-7.5zM0 16.5V24h7.5v-7.5zm8.25 0V24h7.498v-7.5zm8.25 0V24H24v-7.5z"
		fill="currentColor"
	/>
</svg>
