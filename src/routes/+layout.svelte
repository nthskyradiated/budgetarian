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
	import { Bar } from '@bobbymannino/svelte-progress';
	export let data: PageData;

	const flash = getFlash(page);

	$: if ($flash) {
		toast.info($flash.message);
	}
	$: metaTags = extend(true, {}, data.baseMetaTags, $page.data.pageMetaTags);
	setupViewTransition();
</script>

<Bar color="#4caf50" size="small" speed="fast" />
<MetaTags {...metaTags} />
<Toaster richColors closeButton position={'bottom-right'} />
<ModeWatcher />
<div class="mx-64 flex min-h-[100%] w-auto flex-col">
	{#if data.user}
		<h1 class="py-10">Logged in as :: {data.user?.name ?? data.user.username}</h1>
	{/if}
	<slot />
</div>
