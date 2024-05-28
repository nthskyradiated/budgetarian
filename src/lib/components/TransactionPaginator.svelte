<script lang="ts">
	import * as Pagination from '$lib/components/ui/pagination';
	import { page } from '$app/stores';

	export let count = 20;
	export let perPage = 3;
	let siblingCount = 1;
	export let onPageChange: (newPage: number) => void;

	let currentPage = 1;

	$: {
		const pageParam = parseInt($page.url.searchParams.get('page') || '1');
		if (!isNaN(pageParam)) {
			currentPage = pageParam;
		}
	}

	$: totalPages = Math.ceil(count / perPage);

	const changePage = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages) {
			onPageChange(newPage);
		}
	};
</script>

<Pagination.Root {count} {perPage} {siblingCount} {onPageChange} let:pages let:currentPage>
	<Pagination.Content>
		<Pagination.Item>
			<Pagination.PrevButton
				on:click={() => changePage(currentPage ? currentPage + 1 : 1)}
				disabled={currentPage === 1}
			/>
		</Pagination.Item>
		{#each pages as page (page.key)}
			{#if page.type === 'ellipsis'}
				<Pagination.Item>
					<Pagination.Ellipsis />
				</Pagination.Item>
			{:else}
				<Pagination.Item>
					<Pagination.Link
						{page}
						isActive={currentPage == page.value}
						on:click={() => changePage(page.value)}
					>
						{page.value}
					</Pagination.Link>
				</Pagination.Item>
			{/if}
		{/each}
		<Pagination.Item>
			<Pagination.NextButton
				on:click={() => changePage(currentPage ? currentPage + 1 : 1)}
				disabled={currentPage === pages.length + 1}
			/>
		</Pagination.Item>
	</Pagination.Content>
</Pagination.Root>
