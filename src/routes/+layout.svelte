<script lang="ts">
	import '../app.css';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { getFlash } from 'sveltekit-flash-message';
	import { toast } from 'svelte-sonner';
	import { Toaster } from '$lib/components/ui/sonner';
	import { MetaTags } from 'svelte-meta-tags';
	import { setupViewTransition } from 'sveltekit-view-transition';
	import { ModeWatcher } from 'mode-watcher';
	import extend from 'just-extend';
	import { ProgressBar } from '@prgm/sveltekit-progress-bar';
	export let data: PageData;

	const flash = getFlash(page);

	$: if ($flash) {
		toast.info($flash.message);
	}
	$: metaTags = extend(true, {}, data.baseMetaTags, $page.data.pageMetaTags);
	setupViewTransition();
</script>

<ProgressBar color="#7F57F1" zIndex={100} intervalTime={100} />
<MetaTags {...metaTags} />
<Toaster richColors closeButton position={'bottom-right'} />
<ModeWatcher />
<div class="mx-64 flex min-h-[100%] w-auto flex-col">
	{#if data.user}
		<h1 class="py-10 text-right">Logged in as :: {data.user?.name ?? data.user.username}</h1>
	{/if}
	<slot />
</div>
