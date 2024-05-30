// src/lib/utils/chartUtils.ts
import { writable, type Writable } from 'svelte/store';
import type { ChartData } from 'chart.js';
import type { Transaction, TransactionType } from '../types';

const colors: Record<TransactionType, string> = {
	income: '#3b82f6',
	expense: '#dc2626'
};

export const updateChartDataByTotalTransactions = (
	transactions: Transaction[],
	chartData: Writable<ChartData>
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
	const hoverBackgroundColor = backgroundColor;

	chartData.set({
		labels,
		datasets: [
			{
				label: 'Transactions',
				data,
				backgroundColor,
				hoverBackgroundColor
			}
		]
	});
};

export const updateChartDataByCategory = (
    transactions: Transaction[],
    chartData: Writable<ChartData>
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
    const hoverBackgroundColor = backgroundColor;

    chartData.set({
        labels,
        datasets: [
            {
                label: 'Transactions by Category',
                data,
                backgroundColor,
                hoverBackgroundColor
            }
        ]
    });
};

export const updateChartDataByInflowsCategory = (
    transactions: Transaction[],
    chartData: Writable<ChartData>
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
    const hoverBackgroundColor = backgroundColor;

    chartData.set({
        labels,
        datasets: [
            {
                label: 'Income by Category',
                data,
                backgroundColor,
                hoverBackgroundColor
            }
        ]
    });
};

export const updateChartDataByExpensesCategory = (
    transactions: Transaction[],
    chartData: Writable<ChartData>
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
    const hoverBackgroundColor = backgroundColor;

    chartData.set({
        labels,
        datasets: [
            {
                label: 'Expenses by Category',
                data,
                backgroundColor,
                hoverBackgroundColor
            }
        ]
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
