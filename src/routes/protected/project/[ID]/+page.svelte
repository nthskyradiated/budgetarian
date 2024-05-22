<script lang="ts">
	import Card from '@/lib/components/ui/card/card.svelte';
	import Button from '@/lib/components/ui/button/button.svelte';
	import type { PageData } from './$types';
	import TransactionForm from '$lib/components/form/TransactionForm.svelte'
	import { route } from '@/lib/router';

	export let data: PageData;
	const {project} = data
	
</script>


<Card class="my-2 w-2/3 p-6">
	<div class="flex flex-col gap-4">
		<h1 class="text-3xl font-bold mb-2 ">{project?.name}</h1>
		<hr class="mb-8">
		<div class='flex justify-between px-4'><span class="font-bold">Project Details: </span><p class="inline pl-12">{project?.details}</p></div>
		<div class='flex justify-between px-4'><span class="font-bold">Starting Balance: </span><p class="inline pl-12">{project?.startingFunds}</p></div>
		<div class='flex justify-between px-4'><span class="font-bold">Current Balance: </span><p class="inline pl-12">{project?.totalFunds}</p></div>
		<div class='flex justify-between px-4'><span class="font-bold">Updated At: </span><p class="inline pl-12">{project?.updatedAt}</p></div>
		<div class='flex justify-between px-4'><span class="font-bold">Date Created: </span><p class="inline pl-12">{project?.createdAt}</p>
		</div>
	</div>
	<div class="flex gap-12 justify-center text-center mt-12 w-auto m-auto">

		<!-- <TransactionForm
	formData={data.transactionFormData}
	formAction={route('createTransaction /protected/project/[ID]')}
	dialogTitle="Update Transaction"
	dialogDescription="Input all the necessary information to create a new transaction."
	dialogTriggerBtn='Update Transaction'
	dialogSubmitBtn='update'

/>	 -->

		<Button variant={'destructive'}>Remove transaction</Button>
	</div>
</Card>

<TransactionForm
formData={data.transactionFormData}
formAction={route('createTransaction /protected/project/[ID]')}
dialogTitle="Add Transaction"
dialogDescription="Input all the necessary information to create a new transaction."
dialogTriggerBtn='Add New Transaction'
dialogSubmitBtn='add'

/>	