<script lang="ts">
	import * as Pagination from '$lib/components/ui/pagination';
	import { page } from '$app/stores';
	import type { TransactionPaginatorProps } from '../types';

	let { count, perPage, onPageChange }: TransactionPaginatorProps = $props();

	let siblingCount = 1;

	let currentPage = $state(1);

	$effect(() => {
		const pageParam = parseInt($page.url.searchParams.get('page') || '1');
		if (!isNaN(pageParam)) {
			currentPage = pageParam;
		}
	});

	let totalPages = $derived(Math.ceil(count / perPage));

	const changePage = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages) {
			onPageChange(newPage);
		}
	};
</script>

<Pagination.Root {count} {perPage} {siblingCount} {onPageChange}  >
	{#snippet children({ pages, currentPage })}
		<Pagination.Content>
			<Pagination.Item>
				<Pagination.PrevButton
					onclick={() => changePage(currentPage ? currentPage + 1 : 1)}
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
							onclick={() => changePage(page.value)}
						>
							{page.value}
						</Pagination.Link>
					</Pagination.Item>
				{/if}
			{/each}
			<Pagination.Item>
				<Pagination.NextButton
					onclick={() => changePage(currentPage ? currentPage + 1 : 1)}
					disabled={currentPage === pages.length}
				/>
			</Pagination.Item>
		</Pagination.Content>
	{/snippet}
</Pagination.Root>
