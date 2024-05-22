<script lang="ts">
	import Card from '@/lib/components/ui/card/card.svelte';
	import Button from '@/lib/components/ui/button/button.svelte';
	import type { PageData } from './$types';
	import TransactionForm from '$lib/components/form/TransactionForm.svelte';
	import { route } from '@/lib/router';

	export let data: PageData;
	
	const { project, transactionHistory = [] } = data;
</script>

<main>
	<div class='flex flex-row gap-2'>
		<Card class="my-2 w-1/3 p-6">
			<div class="flex flex-col gap-4">
				<div class="flex flex-row justify-between items-center">
					<h1 class="mb-2 text-4xl font-bold">{project?.name}</h1>
					<div class="flex flex-col gap-1">
						<Button variant={'outline'}>Update Project</Button>
						<Button variant={'destructive'}>Delete Project</Button>

					</div>
				</div>
				<hr class="mb-8" />
				<div class="flex justify-between px-4">
					<span class="font-bold">Project Details: </span>
					<p class="inline pl-12">{project?.details}</p>
				</div>
				<div class="flex justify-between px-4">
					<span class="font-bold">Starting Balance: </span>
					<p class="inline pl-12">{project?.startingFunds}</p>
				</div>
				<div class="flex justify-between px-4">
					<span class="font-bold">Current Balance: </span>
					<p class="inline pl-12">{project?.totalFunds}</p>
				</div>
				<div class="flex justify-between px-4">
					<span class="font-bold">Updated At: </span>
					<p class="inline pl-12">{project?.updatedAt}</p>
				</div>
				<div class="flex justify-between px-4">
					<span class="font-bold">Date Created: </span>
					<p class="inline pl-12">{project?.createdAt}</p>
				</div>
			</div>
			<div class="m-auto mt-8 flex w-auto justify-center gap-2 text-center">
		
				<TransactionForm
			formData={data.transactionFormData}
			formAction={route('createTransaction /protected/project/[ID]')}
			dialogTitle="Add Transaction"
			dialogDescription="Input all the necessary information to create a new transaction."
			dialogTriggerBtn="New Transaction"
			dialogSubmitBtn="add"
		/>
		
			</div>
		</Card>
		
		<Card class="my-2 w-2/3 p-6">
			<div class="flex flex-col gap-4">
				<h1 class="mb-2 text-3xl font-bold">Transaction History</h1>
				<hr class="mb-8" />
				<div class="flex flex-col justify-between px-4 gap-2">
					<span class="font-bold">Transaction Details: </span>
					{#each transactionHistory as transaction}
					<p class="inline pl-12">{transaction.name} <span class="mr-0 text-right">{transaction.createdAt}</span> </p>
					{#if transaction.type === 'income'}
					<p class="inline pl-12 text-green-500"><small>+ </small> {transaction.amount}</p>
					{:else if transaction.type === 'expense'}
					<p class="inline pl-12 text-red-500"><small>- </small> {transaction.amount}</p>
					{/if}
					
					{/each}
				</div>
			</div>
			<div class="m-auto mt-12 flex w-auto justify-center gap-4 text-center">
		
				<TransactionForm
			formData={data.transactionFormData}
			formAction={route('createTransaction /protected/project/[ID]')}
			dialogTitle="Add Transaction"
			dialogDescription="Input all the necessary information to create a new transaction."
			dialogTriggerBtn="Add New Transaction"
			dialogSubmitBtn="add"
		/>
			</div>
		</Card>
	</div>
</main>