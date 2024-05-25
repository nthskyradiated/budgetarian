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

	export let data: PageData;

	const { project, transactionHistory = [], updateProjectFormData, ID } = data;
	$: allTransactions = [...transactionHistory];
	// $: totalFunds = project?.totalFunds;
	// $: updatedAt = project?.updatedAt;
	$: currProject = project

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
							currProject.name = updatedData.project[0].name
							currProject.details = updatedData.project[0].details
							currProject.startingFunds = updatedData.project[0].startingFunds
							currProject.totalFunds = updatedData.project[0].totalFunds
						}
					} else {
						console.error('Failed to fetch updated projects');
					}
				} catch (error) {
					console.error('Error fetching updated projects:', error);
				}

				// goto('/protected/projects');
			}
		}
	},
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
				console.error('Failed to fetch updated transactions');
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
      method: 'DELETE',
    });

    if (response.ok) {
		goto('/protected/projects');
		toast.success('Deleted project successfully');
		} else {
			toast.error('Failed to delete project');
		}
	}
</script>

<main>
	<div class="flex flex-row gap-2">
		<Card class="my-2 w-1/3 p-6" on:transactionAdded={handleTransactionAdded}>
			<div class="flex flex-col gap-4">
				<div class="flex flex-row items-center justify-between">
					<h1 class="mb-2 text-4xl font-bold">{currProject?.name}</h1>
					<div class="flex flex-col gap-1">
						<UpdateProjectForm 
						dialogName="Update Project"
						dialogDescription="Input all the necessary information to update a project."
						dialogTitle="Update project?"
						updateProjectFormData={updateProjectFormData!}
						updateProjectFormAction={route("updateProject /protected/projects")}
						projectId={ID as string}
						updateFundsPlaceHolder={project?.totalFunds!}
						/>
						<DeleteProject projectId={ID} on:confirmDelete={()=> handleDeleteProject(ID)} />
					</div>
				</div>
				<hr class="mb-8" />
				<div class="flex justify-between px-4">
					<span class="font-bold">Project Details: </span>
					<p class="inline pl-12">{currProject?.details}</p>
				</div>
				<div class="flex justify-between px-4">
					<span class="font-bold">Starting Balance: </span>
					<p class="inline pl-12">{currProject?.startingFunds}</p>
				</div>
				<div class="flex justify-between px-4">
					<span class="font-bold">Current Balance: </span>
					<p class="inline pl-12">{currProject?.totalFunds}</p>
				</div>
				<div class="flex justify-between px-4">
					<span class="font-bold">Updated At: </span>
					<p class="inline pl-12">{currProject?.updatedAt}</p>
				</div>
				<div class="flex justify-between px-4">
					<span class="font-bold">Date Created: </span>
					<p class="inline pl-12">{project?.createdAt}</p>
				</div>
			</div>
			<div class="m-auto mt-8 flex w-auto justify-center gap-2 text-center"></div>
		</Card>

		<Card class="my-2 w-2/3 p-6">
			<div class="flex flex-col gap-4">
				<div class="flex flex-row items-center justify-between">
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
					<span class="font-bold">Transaction Details: </span>
					{#each allTransactions as transaction}
						<p class="inline pl-12 font-semibold">
							{transaction.name} <small class="ml-8 text-right">{transaction.createdAt}</small>
						</p>
						{#if transaction.type === 'income'}
							<p class="inline pl-12 text-green-500"><small>+ </small> {transaction.amount}</p>
						{:else if transaction.type === 'expense'}
							<p class="inline pl-12 text-red-500"><small>- </small> {transaction.amount}</p>
						{/if}
					{/each}
				</div>
			</div>
			<div class="m-auto mt-12 flex w-auto justify-center gap-4 text-center"></div>
		</Card>
	</div>
</main>
