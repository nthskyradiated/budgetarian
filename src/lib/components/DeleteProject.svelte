<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';


	let {projectId, onDeleteProject} = $props<{projectId: string, onDeleteProject: (projectId: string) => void}>()

	const confirmDelete = async () => {
		onDeleteProject(projectId);
	};
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger asChild let:builder>
		{#if $page.url.pathname === '/protected/projects'}
			<Button
				builders={[builder]}
				variant="ghost"
				size="icon"
				class="absolute right-4 top-4 rounded-full"
			>
				<Icon icon="line-md:close-circle" class="text-2xl text-red-600" />
			</Button>
		{:else}
			<Button builders={[builder]} variant="destructive" class="-mt-8 px-5">Delete Project</Button>
		{/if}
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete your project and remove your data
				from our servers.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmDelete}>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
