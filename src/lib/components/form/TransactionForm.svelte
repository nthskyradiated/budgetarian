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
	import { TransactionZodSchema, TransactionTypeRadioZodSchema, type transactionZodSchema } from '@/lib/zodValidators/zodProjectValidation';

	import { maxNameLen, minNameLen } from '@/lib/zodValidators/zodParams';
	import { Label } from '../ui/label';
	import { page } from '$app/stores';
	
	export let formData: SuperValidated<transactionZodSchema>;
	export let formAction: string;
	export let dialogTitle : string
	export let dialogDescription : string


	const { enhance, form, errors, message, delayed } = superForm(formData, {
		resetForm: true,
		taintedMessage: null,
		validators: zod(TransactionZodSchema),
		dataType: "form",

		onUpdated: () => {
			if (!$message) return;

			const { alertType, alertText } = $message;

			if (alertType === 'error') {
				toast.error(alertText);
			}

			if (alertType === 'success') {
				toast.success(alertText);
			}
		}
	});
</script>

<div class="my-8 flex flex-wrap justify-between gap-4">
	<Dialog.Root>
		<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>Add a New Transaction</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>{dialogTitle}</Dialog.Title>
				<Dialog.Description>
					{dialogDescription}
				</Dialog.Description>
			</Dialog.Header>

			<form
				method="post"
				use:enhance
				action={formAction}
				class="space-y-4"
			>
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
					step='0.01'
					bind:value={$form.amount}
					errorMessage={$errors.amount}
					maxlength={maxNameLen}
					minlength={minNameLen}
				/>

				<RadioGroup.Root bind:value={$form.transactionType.transactionType} class="grid gap-2" {...$$restProps}>
					<div class="flex items-center space-x-2">
					  <RadioGroup.Item value="income" id="r1" />
					  <Label for="r1">inflow</Label>
					</div>
					<div class="flex items-center space-x-2">
					  <RadioGroup.Item value="expense" id="r2" />
					  <Label for="r2">expense</Label>
					</div>
					<RadioGroup.Input name="spacing" />
				  </RadioGroup.Root>

				<SubmitButton disabled={$delayed}>Add Transaction</SubmitButton>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>



