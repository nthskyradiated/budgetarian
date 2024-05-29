// src/lib/utils/chartUtils.ts
import { writable, type Writable } from 'svelte/store';
import type { ChartData } from 'chart.js';
import type { Transaction, TransactionType } from '../types';

const colors: Record<TransactionType, string> = {
	income: '#36A2EB',
	expense: '#FF6384'
};

export const updateChartData = (transactions: Transaction[], chartData: Writable<ChartData>) => {
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
