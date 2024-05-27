<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { buttonVariants } from '../ui/button';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms/client';
	import InputField from './InputField.svelte';
	import SubmitButton from './SubmitButton.svelte';
	import { zod } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import {
		TransactionZodSchema,
		type transactionZodSchema
	} from '@/lib/zodValidators/zodProjectValidation';
	import {
		maxNameLen,
		minNameLen,
		EXPENSES_CATEGORIES,
		INFLOWS_CATEGORIES
	} from '@/lib/zodValidators/zodParams';
	import { Label } from '../ui/label';
	import { Switch } from '$lib/components/ui/switch/index';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Textarea } from '../ui/textarea';
	import { createEventDispatcher } from 'svelte';
	// import SuperDebug from 'sveltekit-superforms';
	// import * as Select from "$lib/components/ui/select"

	export let formData: SuperValidated<transactionZodSchema>;
	export let formAction: string;
	export let dialogTitle: string;
	export let dialogTriggerBtn: string;
	export let dialogDescription: string;
	export let dialogSubmitBtn: string;
	$: open = false;

	const dispatch = createEventDispatcher();

	const { enhance, form, errors, message, delayed } = superForm(formData, {
		resetForm: true,
		taintedMessage: null,
		validators: zod(TransactionZodSchema),
		dataType: 'json',
		onUpdate: (form) => {
			if (form.result?.type === 'success') {
				open = false;
			}
		},
		onUpdated: async () => {
			if (!$message) return;

			const { alertType, alertText } = $message;

			if (alertType === 'error') {
				toast.error(alertText);
			}

			if (alertType === 'success') {
				dispatch('transactionAdded');
				toast.success(alertText);
			}
		}
	});

	let selectedTransactionType = $form.transactionType.transactionType;
	let selectedCategory: string | undefined = $form.transactionType.categories;
	let categoriesValues =
		selectedTransactionType === 'income' ? INFLOWS_CATEGORIES.options : EXPENSES_CATEGORIES.options;

	$: {
		if ($form.transactionType.transactionType === 'income') {
			categoriesValues = [...INFLOWS_CATEGORIES.options];
		} else if ($form.transactionType.transactionType === 'expenses') {
			categoriesValues = [...EXPENSES_CATEGORIES.options];
		}
	}

	function handleTransactionTypeChange(event: 'income' | 'expenses') {
		console.log(event);
		selectedTransactionType = event;
		categoriesValues =
			selectedTransactionType === 'income'
				? INFLOWS_CATEGORIES.options
				: EXPENSES_CATEGORIES.options;
		console.log('values: ', categoriesValues);
	}

	$: {
		selectedTransactionType,
			(selectedCategory = $form.transactionType.categories
				? $form.transactionType.categories
				: undefined);
	}

	export const getTransactionHistory = async (ID: string) => {
		try {
			const response = await fetch(`/protected/project/${ID}/`);
			if (response.ok) {
				const updatedData = await response.json();
				return updatedData.allTransactions;
			} else {
				console.error('Failed to fetch updated projects');
			}
		} catch (error) {
			console.error('Error fetching updated projects:', error);
		}
	};
</script>

<!-- <SuperDebug data={$form} /> -->

<div class="mt-4 flex flex-wrap justify-between gap-4">
	<Dialog.Root bind:open>
		<Dialog.Trigger class={buttonVariants({ variant: 'default' })}
			>{dialogTriggerBtn}</Dialog.Trigger
		>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>{dialogTitle}</Dialog.Title>
				<Dialog.Description>
					{dialogDescription}
				</Dialog.Description>
			</Dialog.Header>

			<form method="post" use:enhance action={formAction} class="space-y-4">
				<InputField
					type="text"
					name="name"
					label="Transaction Name"
					bind:value={$form.name}
					errorMessage={$errors.name}
					maxlength={maxNameLen}
					minlength={minNameLen}
				/>
				<InputField
					type="number"
					name="transactionAmount"
					label="Transaction Amount"
					step="0.01"
					bind:value={$form.amount}
					errorMessage={$errors.amount}
				/>

				<Switch id="recurring" bind:checked={$form.isRecurring} />
				<Label for="isRecurring">Toggle Recurring</Label>

				<RadioGroup.Root
					bind:value={$form.transactionType.transactionType}
					class="grid gap-2"
					{...$$restProps}
				>
					<div class="flex items-center space-x-2">
						<RadioGroup.Item
							value="income"
							id="r1"
							on:click={() => handleTransactionTypeChange('income')}
						/>
						<Label for="r1">inflow</Label>
					</div>
					<div class="flex items-center space-x-2">
						<RadioGroup.Item
							value="expenses"
							id="r2"
							on:click={() => handleTransactionTypeChange('expenses')}
						/>
						<Label for="r2">expense</Label>
					</div>
					<RadioGroup.Input name="spacing" />
				</RadioGroup.Root>

				<!-- @Todo check back with ShadCN-svelte team -->

				<!-- <Select.Root bind:selected={selectedCategory}>
					<Select.Trigger class="w-[180px]">
						<Select.Value placeholder="Category" />
					</Select.Trigger>
					<Select.Content>
							{#each categoriesValues as category}
								<Select.Item value={category} on:click={() => selectedCategory = category}>{category}</Select.Item>
							{/each}
					</Select.Content>
				</Select.Root>
				<input type="text" name="categories" bind:value={selectedCategory} /> -->

				<DropdownMenu.Root>
					<DropdownMenu.Trigger class="rounded-md border p-2 text-sm text-green-500"
						>{selectedCategory || 'Select Category'}</DropdownMenu.Trigger
					>
					<DropdownMenu.Content>
						<DropdownMenu.RadioGroup bind:value={$form.transactionType.categories}>
							{#each categoriesValues as category}
								<DropdownMenu.RadioItem value={category}>{category}</DropdownMenu.RadioItem>
							{/each}
						</DropdownMenu.RadioGroup>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
				<Textarea placeholder="Type your remarks here." bind:value={$form.remarks} />

				<SubmitButton disabled={$delayed}>{dialogSubmitBtn}</SubmitButton>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
