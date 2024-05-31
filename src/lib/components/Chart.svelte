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
        updateChartDataByExpensesCategory
    } from '$lib/utils/chartUtils';
    import { get } from 'svelte/store';
	import type { Transaction } from '../types';

    ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, BarElement, LineElement);

    let chartCanvas: HTMLCanvasElement;
    let chart: ChartJS | null = null;

    export let transactions: Transaction[] = [];
    export let viewType: 'total' | 'category' | 'inflows' | 'expenses' = 'total';
    export let chartType: ChartType = 'doughnut';

    onMount(() => {
        if (chartCanvas) {
            chart = new ChartJS(chartCanvas, {
                type: 'doughnut',
                data: get(chartData),
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
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

	$: if (chart) {
        if (viewType === 'total') {
            updateChartDataByTotalTransactions(transactions, chartData);
        } else if (viewType === 'category') {
            updateChartDataByCategory(transactions, chartData);
        } else if (viewType === 'inflows') {
            updateChartDataByInflowsCategory(transactions, chartData);
        } else if (viewType === 'expenses') {
            updateChartDataByExpensesCategory(transactions, chartData);
        }
        chart.config.type = chartType;
        chart.data = get(chartData);
        chart.update();
    }

    onDestroy(() => {
        if (chart) {
            chart.destroy();
        }
    });
</script>

<select bind:value={viewType}>
    <option value="total">Total Transactions</option>
    <option value="category">Transactions by Category</option>
    <option value="inflows">Income by Category</option>
    <option value="expenses">Expenses by Category</option>
</select>
<select bind:value={chartType}>
    <option value="doughnut">Doughnut</option>
    <option value="bar">Bar</option>
    <option value="line">Line</option>
    <option value="pie">Pie</option>
</select>

<canvas bind:this={chartCanvas}></canvas>
