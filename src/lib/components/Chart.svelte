<!-- src/lib/components/DoughnutChart.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		ArcElement,
		CategoryScale,
		type ChartData
	} from 'chart.js/auto';

	ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

	export let data: ChartData;

	let chartCanvas: HTMLCanvasElement;
	let chart: ChartJS | null = null;

	onMount(() => {
		if (chartCanvas) {
			chart = new ChartJS(chartCanvas, {
				type: 'doughnut',
				data: data,
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
		chart.data = data;
		chart.update();
	}

	onDestroy(() => {
		if (chart) {
			chart.destroy();
		}
	});
</script>

<canvas bind:this={chartCanvas}></canvas>
