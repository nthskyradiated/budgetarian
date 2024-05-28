<script lang="ts">
	import Card from '@/lib/components/ui/card/card.svelte';
	import type { PageData } from './$types';
	import TransactionForm from '$lib/components/form/TransactionForm.svelte';
	import { route } from '@/lib/router';
	import { onMount } from 'svelte';
	import DeleteProject from '@/lib/components/DeleteProject.svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import UpdateProjectForm from '@/lib/components/form/UpdateProjectForm.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import DeleteTransaction from '@/lib/components/DeleteTransaction.svelte';
	import TransactionPaginator from '@/lib/components/TransactionPaginator.svelte';
	import ScrollArea from '@/lib/components/ui/scroll-area/scroll-area.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { page } from '$app/stores';
	// import SuperDebug from 'sveltekit-superforms';

	export let data: PageData;

	const handlePageChange = async (newPage: number) => {
		console.log('handlePageChange called with newPage:', newPage); // Debug log

		const url = new URL($page.url.href);
		url.searchParams.set('page', newPage.toString());

		const response = await fetch(url.toString());
		if (response.ok) {
			const result = await response.json();
			allTransactions = result.allTransactions;
		} else {
			console.error('Failed to fetch transactions for new page');
		}

		goto(url.toString(), { replaceState: true });
	};
	$: $page.url.searchParams.get('page'); // Re-trigger when page param changes

	const { project, transactionHistory = [], updateProjectFormData, ID } = data;
	$: allTransactions = [...transactionHistory];
	// $: totalFunds = project?.totalFunds;
	// $: updatedAt = project?.updatedAt;
	$: currProject = project;
	let totalCount: number;
	let perPage: number;

	const { message: updateProjectFormMessage } = superForm(updateProjectFormData!, {
		onUpdated: async () => {
			if (!$updateProjectFormMessage) return;

			const { alertType, alertText } = $updateProjectFormMessage;

			if (alertType === 'error') {
				toast.error(alertText);
			}

			if (alertType === 'success') {
				toast.success(alertText);
				try {
					const response = await fetch(`/protected/project/${data.ID}`);
					if (response.ok) {
						const updatedData = await response.json();
						if (currProject) {
							currProject.name = updatedData.project[0].name;
							currProject.details = updatedData.project[0].details;
							currProject.startingFunds = updatedData.project[0].startingFunds;
							currProject.totalFunds = updatedData.project[0].totalFunds;
						}
					} else {
						console.error('Failed to fetch updated project');
					}
				} catch (error) {
					console.error('Error fetching updated project:', error);
				}
			}
		}
	});

	async function fetchTransactions() {
		try {
			const response = await fetch(`/protected/project/${data.ID}/`);
			if (response.ok) {
				const updatedData = await response.json();
				if (currProject) {
					allTransactions = updatedData.allTransactions;
					currProject.totalFunds = updatedData.project[0].totalFunds;
					currProject.updatedAt = updatedData.project[0].updatedAt;
					totalCount = updatedData.pagination.totalCount;
					perPage = updatedData.pagination.pageSize;
				}
			} else {
				toast.error('Failed to fetch updated transactions');
			}
		} catch (error) {
			console.error('Error fetching updated transactions:', error);
		}
	}
	onMount(fetchTransactions);

	const handleTransactionAdded = async () => {
		await fetchTransactions();
	};

	const handleDeleteProject = async (ID: string | undefined) => {
		const response = await fetch(`/protected/project/${ID}`, {
			method: 'DELETE'
		});

		if (response.ok) {
			goto('/protected/projects');
			toast.success('Deleted project successfully');
		} else {
			toast.error('Failed to delete project');
		}
	};
	const handleDeleteTransaction = async (transactionID: string, ID: string | undefined) => {
		const response = await fetch(`/protected/transactions/${transactionID}`, {
			method: 'DELETE'
		});

		if (response.ok) {
			goto(`/protected/project/${ID}`);
			await fetchTransactions();
			toast.success('Deleted transaction successfully');
		} else {
			toast.error('Failed to delete transaction');
		}
	};
</script>

<!-- <SuperDebug data={$updateProjectForm} /> -->

<main class="w-full">
	<div class="mx-4 my-4 flex w-96 flex-col-reverse gap-2 sm:mx-auto md:w-full md:flex-row">
		<Card
			class="my-2 h-max w-full p-6 md:flex-1 lg:w-1/3"
			on:transactionAdded={handleTransactionAdded}
		>
			<div class="flex flex-col gap-4">
				<div class="items-left flex flex-col gap-6 sm:flex-row sm:justify-between">
					<h1 class="text-4xl font-bold">{currProject?.name}</h1>
					<div class="flex flex-col items-start justify-evenly sm:items-center">
						<UpdateProjectForm
							dialogName="Update Project"
							dialogDescription="Input all the necessary information to update a project."
							dialogTitle="Update project?"
							updateProjectFormData={updateProjectFormData!}
							updateProjectFormAction={route('updateProject /protected/projects')}
							projectId={ID as string}
							updateFundsPlaceHolder={project?.totalFunds!}
							nameDefaultVal={project?.name!}
							detailsDefaultVal={project?.details!}
						/>
						<DeleteProject projectId={ID} on:confirmDelete={() => handleDeleteProject(ID)} />
					</div>
				</div>
				<hr class="mb-8" />
				<div class="flex flex-col justify-evenly px-4 pt-4 sm:flex-row sm:justify-between sm:pt-2">
					<span class="text-lg font-bold">Project Details: </span>
					<p class="mt-2 inline sm:mt-0 sm:pl-12 sm:text-right">{currProject?.details}</p>
				</div>
				<div class="flex flex-col justify-evenly px-4 pt-4 sm:flex-row sm:justify-between sm:pt-2">
					<span class="text-lg font-bold">Starting Balance: </span>
					<p class="mt-2 inline sm:mt-0 sm:pl-12 sm:text-right">{currProject?.startingFunds}</p>
				</div>
				<div class="flex flex-col justify-evenly px-4 pt-4 sm:flex-row sm:justify-between sm:pt-2">
					<span class="text-lg font-bold">Current Balance: </span>
					<p class="mt-2 inline sm:mt-0 sm:pl-12 sm:text-right">{currProject?.totalFunds}</p>
				</div>
				<div class="flex flex-col justify-evenly px-4 pt-4 sm:flex-row sm:justify-between sm:pt-2">
					<span class="text-lg font-bold">Updated At: </span>
					<p class="mt-2 inline sm:mt-0 sm:pl-12 sm:text-right">{currProject?.updatedAt}</p>
				</div>
				<div class="flex flex-col justify-evenly px-4 pt-4 sm:flex-row sm:justify-between sm:pt-2">
					<span class="text-lg font-bold">Date Created: </span>
					<p class="mt-2 inline sm:mt-0 sm:pl-12 sm:text-right">{project?.createdAt}</p>
				</div>
			</div>
			<div class="m-auto mt-8 flex w-auto justify-center gap-2 text-center"></div>
		</Card>

		<Card class="my-2 w-full px-6 md:flex-1 md:flex-shrink-0 md:flex-grow md:basis-1/2 lg:w-2/3">
			<div class="flex flex-col gap-4">
				<div class="flex flex-col items-end justify-between sm:flex-row">
					<h1 class="my-2 text-3xl font-bold">Transaction History</h1>
					{#if data.transactionFormData}
						<TransactionForm
							formData={data.transactionFormData}
							formAction={route('createTransaction /protected/project/[ID]')}
							dialogTitle="Add Transaction"
							dialogDescription="Input all the necessary information to create a new transaction."
							dialogTriggerBtn="Add New Transaction"
							dialogSubmitBtn="add"
							DialogID={data.ID as string}
							on:transactionAdded={handleTransactionAdded}
						/>
					{/if}
				</div>
				<hr class="sm:mb-8" />
				{#if allTransactions.length === 0}
					<p class="-mt-8">No transaction for this project yet.</p>
				{:else}
					<h3 class="mb-6 text-2xl font-bold">Transaction Details:</h3>

					<TransactionPaginator count={totalCount} {perPage} onPageChange={handlePageChange} />
				{/if}
				<ScrollArea class="h-80 w-full">
					<div class="flex flex-col justify-between gap-2 px-8 pt-1">
						{#each allTransactions as transaction}
							<span class=" relative inline-flex gap-8 pl-4 font-semibold">
								<DeleteTransaction
									transactionId={transaction.id}
									on:confirmDeleteTransaction={() => handleDeleteTransaction(transaction.id, ID)}
								/>

								<Tooltip.Root>
									<Tooltip.Trigger>{transaction.name}</Tooltip.Trigger>
									<Tooltip.Content>
										<p>- {transaction.type}</p>
										<p>- {transaction.amount}</p>
										{#if transaction.isRecurring}
											<p>- recurring transaction</p>
										{/if}
										{#if transaction.remarks}
											<p>- {transaction.remarks}</p>
										{/if}
									</Tooltip.Content>
								</Tooltip.Root>

								<small class="text-right">{transaction.createdAt}</small>
							</span>
							{#if transaction.type === 'income'}
								<p class="mb-2 inline pl-4 text-green-500">
									<small>+ </small>
									{transaction.amount}
								</p>
							{:else if transaction.type === 'expense'}
								<p class="mb-2 inline pl-4 text-red-500"><small>- </small> {transaction.amount}</p>
							{/if}
							<hr class="mb-8 border-dotted border-gray-500" />
						{/each}
					</div>
				</ScrollArea>
			</div>
			<div class="m-auto mt-12 flex w-auto justify-center gap-4 text-center"></div>
		</Card>
	</div>
</main>
