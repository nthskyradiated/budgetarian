<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Icon from '@iconify/svelte';

	let { transactionId, ID, onDeleteTransaction } = $props<{
		ID: string;
		transactionId: string;
		onDeleteTransaction: (transactionId: string, ID: string) => void;
	}>();

	const confirmDeleteTransaction = () => {
		onDeleteTransaction(transactionId, ID);
	};
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger asChild let:builder>
		<Button
			size="icon"
			builders={[builder]}
			variant="ghost"
			class="absolute -left-8 -top-1 rounded-full"
		>
			<Icon icon="line-md:close-circle" class="text-xl text-red-600" />
		</Button>
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete the transaction.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmDeleteTransaction}>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
