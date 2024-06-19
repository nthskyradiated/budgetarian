<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	// import Icon from '@iconify/svelte';
	import type { DeleteUserProps } from '../types';

	let { onDeleteUser }: DeleteUserProps = $props();

	const confirmDeleteUser = async () => {
		onDeleteUser();
	};
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger asChild let:builder>
		<Button builders={[builder]} variant="destructive" class="-mt-8 px-6">Delete Account</Button>
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete your account and remove your data
				from our servers.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmDeleteUser}>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
