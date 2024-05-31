// src/lib/utils/chartUtils.ts
import { writable, type Writable } from 'svelte/store';
import type { ChartData, ChartType } from 'chart.js';
import type { Transaction, TransactionType } from '../types';

const colors: Record<TransactionType, string> = {
	income: '#22c55e',
	expense: '#dc2626'
};

const getDataset = (
	label: string,
	data: number[],
	backgroundColor: string[],
	chartType: ChartType
) => {
	const dataset = {
		label,
		data,
		backgroundColor,
		hoverBackgroundColor: backgroundColor
	};

	if (chartType === 'line') {
		return {
			...dataset,
			borderColor: '#4BC0C0'
		};
	}

	return dataset;
};

export const updateChartDataByTotalTransactions = (
	transactions: Transaction[],
	chartData: Writable<ChartData>,
	chartType: ChartType
) => {
	const groupedTransactions: Record<TransactionType, number> = {
		income: 0,
		expense: 0
	};

	transactions.forEach((transaction: Transaction) => {
		const transactionType: TransactionType = transaction.type as TransactionType;
		groupedTransactions[transactionType] += transaction.amount;
	});

	const labels = Object.keys(groupedTransactions) as TransactionType[];
	const data = Object.values(groupedTransactions);
	const backgroundColor = labels.map((label) => colors[label]);

	chartData.set({
		labels,
		datasets: [getDataset('Transactions', data, backgroundColor, chartType)]
	});
};

export const updateChartDataByCategory = (
	transactions: Transaction[],
	chartData: Writable<ChartData>,
	chartType: ChartType
) => {
	const groupedTransactions: Record<string, number> = {};

	transactions.forEach((transaction: Transaction) => {
		const category = transaction.category || 'Uncategorized';
		if (!groupedTransactions[category]) {
			groupedTransactions[category] = 0;
		}
		groupedTransactions[category] += transaction.amount;
	});

	const labels = Object.keys(groupedTransactions);
	const data = Object.values(groupedTransactions);
	const backgroundColor = generateColors(labels.length);

	chartData.set({
		labels,
		datasets: [getDataset('Transactions', data, backgroundColor, chartType)]
	});
};

export const updateChartDataByInflowsCategory = (
	transactions: Transaction[],
	chartData: Writable<ChartData>,
	chartType: ChartType
) => {
	const groupedTransactions: Record<string, number> = {};

	transactions.forEach((transaction: Transaction) => {
		if (transaction.type === 'income') {
			const category = transaction.category || 'Uncategorized';
			if (!groupedTransactions[category]) {
				groupedTransactions[category] = 0;
			}
			groupedTransactions[category] += transaction.amount;
		}
	});

	const labels = Object.keys(groupedTransactions);
	const data = Object.values(groupedTransactions);
	const backgroundColor = generateColors(labels.length);

	chartData.set({
		labels,
		datasets: [getDataset('Transactions', data, backgroundColor, chartType)]
	});
};

export const updateChartDataByExpensesCategory = (
	transactions: Transaction[],
	chartData: Writable<ChartData>,
	chartType: ChartType
) => {
	const groupedTransactions: Record<string, number> = {};

	transactions.forEach((transaction: Transaction) => {
		if (transaction.type === 'expense') {
			const category = transaction.category || 'Uncategorized';
			if (!groupedTransactions[category]) {
				groupedTransactions[category] = 0;
			}
			groupedTransactions[category] += transaction.amount;
		}
	});

	const labels = Object.keys(groupedTransactions);
	const data = Object.values(groupedTransactions);
	const backgroundColor = generateColors(labels.length);

	chartData.set({
		labels,
		datasets: [getDataset('Transactions', data, backgroundColor, chartType)]
	});
};

export const updateChartDataForAllTransactions = (
	transactions: Transaction[],
	chartData: Writable<ChartData>,
	chartType: ChartType
) => {
	const colors = generateColors(transactions.length);

	const labels = transactions.map((transaction) => transaction.name);
	const data = transactions.map((transaction) => transaction.amount);
	const backgroundColor = colors;
	// const hoverBackgroundColor = colors;

	chartData.set({
		labels,
		datasets: [getDataset('Transactions', data, backgroundColor, chartType)]
	});
};

export const chartData = writable<ChartData>({
	labels: [],
	datasets: [
		{
			label: 'Transactions',
			data: [],
			backgroundColor: [],
			hoverBackgroundColor: []
		}
	]
});

export const generateColors = (numColors: number) => {
	const colors = [];
	for (let i = 0; i < numColors; i++) {
		const hue = ((i * 360) / numColors) % 360;
		colors.push(`hsl(${hue}, 70%, 60%)`);
	}
	return colors;
};

export const chartTypes = [
	{ value: 'line', label: 'Line' },
	{ value: 'pie', label: 'Pie' },
	{ value: 'bar', label: 'Bar' },
	{ value: 'doughnut', label: 'Doughnut' }
];

export const transactionTypes = [
	{ value: 'total', label: 'Total Transactions' },
	{ value: 'expenses', label: 'Expenses by Category' },
	{ value: 'inflows', label: 'Income by Category' },
	{ value: 'category', label: 'Transactions by Category' },
	{ value: 'all', label: 'All Transactions' }
];
