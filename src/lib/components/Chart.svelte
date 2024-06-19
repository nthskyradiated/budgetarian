<!-- src/lib/components/DoughnutChart.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		ArcElement,
		BarElement,
		LineElement,
		CategoryScale,
		type ChartType
	} from 'chart.js/auto';
	import {
		chartData,
		updateChartDataByTotalTransactions,
		updateChartDataByCategory,
		updateChartDataByInflowsCategory,
		updateChartDataByExpensesCategory,
		updateChartDataForAllTransactions,
		chartTypes,
		transactionTypes
	} from '$lib/utils/chartUtils';
	import { get } from 'svelte/store';
	import type { Transaction } from '../types';
	import * as DropdownMenu from './ui/dropdown-menu';
	import { Separator } from './ui/separator';

	ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, BarElement, LineElement);

	type ChartProps = {
		transactions: Transaction[];
		viewType: 'total' | 'category' | 'inflows' | 'expenses' | 'all';
		chartType: ChartType;
	};

	let chartCanvas: HTMLCanvasElement;
	let chart: ChartJS | null = null;
	let { transactions, viewType, chartType }: ChartProps = $props();

	function updateChartType(type: ChartType) {
		if (chart && chart.config.data.datasets[0]?.type !== type) {
			chart.destroy();
			chart = new ChartJS(chartCanvas, {
				type,
				data: get(chartData),
				options: {
					responsive: true,
					plugins: {
						legend: {
							position: 'bottom',
							display: true
						},
						title: {
							display: true,
							text: 'Transaction Breakdown'
						}
					}
				}
			});
		}
	}

	onMount(() => {
		if (chartCanvas) {
			chart = new ChartJS(chartCanvas, {
				type: chartType,
				data: get(chartData),
				options: {
					responsive: true,
					plugins: {
						legend: {
							position: 'bottom',
							display: true
						},
						title: {
							display: true,
							text: 'Transaction Breakdown'
						}
					}
				}
			});
		}
	});

	$effect(() => {
		if (chart) {
			if (viewType === 'total') {
				updateChartDataByTotalTransactions(transactions, chartData, chartType);
			} else if (viewType === 'category') {
				updateChartDataByCategory(transactions, chartData, chartType);
			} else if (viewType === 'inflows') {
				updateChartDataByInflowsCategory(transactions, chartData, chartType);
			} else if (viewType === 'expenses') {
				updateChartDataByExpensesCategory(transactions, chartData, chartType);
			} else if (viewType === 'all') {
				updateChartDataForAllTransactions(transactions, chartData, chartType);
			}
			updateChartType(chartType);
			chart.data = get(chartData);
			chart.update();
		}
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
		}
	});
</script>

<div class="mb-2 flex w-auto flex-row justify-evenly">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class="w-2/5 rounded-md border text-sm dark:text-white"
			>by {viewType || 'Chart Type'}</DropdownMenu.Trigger
		>
		<DropdownMenu.Content style="width: 400px height: 400px;">
			<DropdownMenu.RadioGroup bind:value={viewType}>
				{#each transactionTypes as transactionType}
					<DropdownMenu.RadioItem value={transactionType.value}
						>{transactionType.label}</DropdownMenu.RadioItem
					>
				{/each}
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
	<Separator orientation="vertical" style="height: 40px;" />
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class="w-2/5 rounded-md border text-sm dark:text-white"
			>Chart Type: {chartType || 'Chart Type'}</DropdownMenu.Trigger
		>
		<DropdownMenu.Content style="width: 400px height: 400px;">
			<DropdownMenu.RadioGroup bind:value={chartType}>
				{#each chartTypes as chartType}
					<DropdownMenu.RadioItem value={chartType.value}>{chartType.label}</DropdownMenu.RadioItem>
				{/each}
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>

<canvas bind:this={chartCanvas} class="backdrop-brightness-125"></canvas>
