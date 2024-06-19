<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { getFlash } from 'sveltekit-flash-message';
	import { toast } from 'svelte-sonner';
	import { Toaster } from '$lib/components/ui/sonner';
	import { MetaTags } from 'svelte-meta-tags';
	import { setupViewTransition } from 'sveltekit-view-transition';
	import { ModeWatcher } from 'mode-watcher';
	import extend from 'just-extend';
	import { ProgressBar } from '@prgm/sveltekit-progress-bar';
	import NavBar from '@/lib/components/NavBar.svelte';
	import Footer from '@/lib/components/Footer.svelte';
	import Header from '@/lib/components/Header.svelte';
	let { data, children } = $props();

	const flash = getFlash(page);

	$effect(() => {
		if ($flash) {
			toast.info($flash.message);
		}
	});
	let metaTags = $state(extend(true, {}, data.baseMetaTags, $page.data.pageMetaTags));

	setupViewTransition();
</script>

<ProgressBar color="#22c55e" zIndex={100} intervalTime={100} />
<MetaTags {...metaTags} />
<Toaster richColors closeButton position={'bottom-right'} />
<ModeWatcher />

<div class="mx-auto flex min-h-[100%] w-full flex-col justify-between">
	{#if data.user}
		<NavBar user={data.user} />
	{:else}
		<Header />
	{/if}
	{@render children()}
</div>
<Footer />
