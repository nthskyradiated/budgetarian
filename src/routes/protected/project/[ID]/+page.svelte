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
	// import SuperDebug from 'sveltekit-superforms';
	import DeleteTransaction from '@/lib/components/DeleteTransaction.svelte';

	export let data: PageData;

	const { project, transactionHistory = [], updateProjectFormData, ID } = data;
	$: allTransactions = [...transactionHistory];
	// $: totalFunds = project?.totalFunds;
	// $: updatedAt = project?.updatedAt;
	$: currProject = project;

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
	<div class="mx-0 my-12 flex w-full flex-col-reverse gap-2 sm:mx-auto lg:flex-row">
		<Card class="my-2 h-max w-full p-6 lg:w-1/3" on:transactionAdded={handleTransactionAdded}>
			<div class="flex flex-col gap-4">
				<div
					class="flex flex-col items-center justify-evenly gap-12 sm:flex-row sm:justify-between"
				>
					<h1 class="text-center text-4xl font-bold">{currProject?.name}</h1>
					<div class="flex flex-col items-center justify-evenly">
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
					<p class="mt-2 inline sm:mt-0 sm:pl-12">{currProject?.details}</p>
				</div>
				<div class="flex flex-col justify-evenly px-4 pt-4 sm:flex-row sm:justify-between sm:pt-2">
					<span class="text-lg font-bold">Starting Balance: </span>
					<p class="mt-2 inline sm:mt-0 sm:pl-12">{currProject?.startingFunds}</p>
				</div>
				<div class="flex flex-col justify-evenly px-4 pt-4 sm:flex-row sm:justify-between sm:pt-2">
					<span class="text-lg font-bold">Current Balance: </span>
					<p class="mt-2 inline sm:mt-0 sm:pl-12">{currProject?.totalFunds}</p>
				</div>
				<div class="flex flex-col justify-evenly px-4 pt-4 sm:flex-row sm:justify-between sm:pt-2">
					<span class="text-lg font-bold">Updated At: </span>
					<p class="mt-2 inline sm:mt-0 sm:pl-12">{currProject?.updatedAt}</p>
				</div>
				<div class="flex flex-col justify-evenly px-4 pt-4 sm:flex-row sm:justify-between sm:pt-2">
					<span class="text-lg font-bold">Date Created: </span>
					<p class="mt-2 inline sm:mt-0 sm:pl-12">{project?.createdAt}</p>
				</div>
			</div>
			<div class="m-auto mt-8 flex w-auto justify-center gap-2 text-center"></div>
		</Card>

		<Card class="my-2 w-full p-6 lg:w-2/3">
			<div class="flex flex-col gap-4">
				<div class="flex flex-col items-center justify-between sm:flex-row">
					<h1 class="mb-2 text-3xl font-bold">Transaction History</h1>
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
				<hr class="mb-8" />
				<div class="flex flex-col justify-between gap-2 px-4">
					<h3 class="mb-6 text-2xl font-bold">Transaction Details:</h3>
					{#each allTransactions as transaction}
						<span class=" relative inline-flex gap-8 pl-4 font-semibold">
							<DeleteTransaction
								transactionId={transaction.id}
								on:confirmDeleteTransaction={() => handleDeleteTransaction(transaction.id, ID)}
							/>
							{transaction.name} <small class="text-right">{transaction.createdAt}</small>
						</span>
						{#if transaction.type === 'income'}
							<p class="mb-2 inline pl-4 text-green-500"><small>+ </small> {transaction.amount}</p>
						{:else if transaction.type === 'expense'}
							<p class="mb-2 inline pl-4 text-red-500"><small>- </small> {transaction.amount}</p>
						{/if}
						<hr class="mb-8 border-dotted border-gray-500" />
					{/each}
				</div>
			</div>
			<div class="m-auto mt-12 flex w-auto justify-center gap-4 text-center"></div>
		</Card>
	</div>
</main>
