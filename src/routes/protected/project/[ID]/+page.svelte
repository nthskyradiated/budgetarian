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

	const { message: updateProjectFormMessage } = superForm(
		updateProjectFormData!,
		{
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
							console.error('Failed to fetch updated projects');
						}
					} catch (error) {
						console.error('Error fetching updated projects:', error);
					}
				}
			}
		}
	);

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
	<div class="flex lg:flex-row gap-2 my-12 sm:mx-auto mx-0 flex-col-reverse w-full">
		<Card class="my-2 lg:w-1/3 p-6 w-full h-max" on:transactionAdded={handleTransactionAdded}>
			<div class="flex flex-col gap-4">
				<div class="flex sm:flex-row flex-col items-center sm:justify-between justify-evenly gap-12 ">
					<h1 class="text-4xl font-bold text-center">{currProject?.name}</h1>
					<div class="flex flex-col justify-evenly items-center">
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
				<div class="flex sm:flex-row flex-col sm:justify-between justify-evenly px-4 sm:pt-2 pt-4">
					<span class="font-bold text-lg">Project Details: </span>
					<p class="inline sm:pl-12 mt-2 sm:mt-0">{currProject?.details}</p>
				</div>
				<div class="flex sm:flex-row flex-col sm:justify-between justify-evenly px-4 sm:pt-2 pt-4">
					<span class="font-bold text-lg">Starting Balance: </span>
					<p class="inline sm:pl-12 mt-2 sm:mt-0">{currProject?.startingFunds}</p>
				</div>
				<div class="flex sm:flex-row flex-col sm:justify-between justify-evenly px-4 sm:pt-2 pt-4">
					<span class="font-bold text-lg">Current Balance: </span>
					<p class="inline sm:pl-12 mt-2 sm:mt-0">{currProject?.totalFunds}</p>
				</div>
				<div class="flex sm:flex-row flex-col sm:justify-between justify-evenly px-4 sm:pt-2 pt-4">
					<span class="font-bold text-lg">Updated At: </span>
					<p class="inline sm:pl-12 mt-2 sm:mt-0">{currProject?.updatedAt}</p>
				</div>
				<div class="flex sm:flex-row flex-col sm:justify-between justify-evenly px-4 sm:pt-2 pt-4">
					<span class="font-bold text-lg">Date Created: </span>
					<p class="inline sm:pl-12 mt-2 sm:mt-0">{project?.createdAt}</p>
				</div>
			</div>
			<div class="m-auto mt-8 flex w-auto justify-center gap-2 text-center"></div>
		</Card>

		<Card class="my-2 lg:w-2/3 p-6 w-full">
			<div class="flex flex-col gap-4">
				<div class="flex sm:flex-row flex-col items-center justify-between">
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
