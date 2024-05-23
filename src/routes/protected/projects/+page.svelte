<script lang="ts">
	import { route } from '@/lib/router';
	import type { PageData } from './$types';
	import SubmitButton from '@/lib/components/form/SubmitButton.svelte';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms/client';
	import * as Dialog from '$lib/components/ui/dialog';
	import InputField from '@/lib/components/form/InputField.svelte';
	import { Button, buttonVariants } from '@/lib/components/ui/button';
	import { zod } from 'sveltekit-superforms/adapters';
	import { CreateProjectZodSchema } from '@/lib/zodValidators/zodProjectValidation';
	import { maxNameLen, minNameLen } from '@/lib/zodValidators/zodParams';
	// import SuperDebug from 'sveltekit-superforms';
	import { goto } from '$app/navigation';
	import Card from '@/lib/components/ui/card/card.svelte';
	import DeleteProject from '@/lib/components/DeleteProject.svelte';
	export let data: PageData;

	const { allProjects = [] } = data;
	let newProjects = [...allProjects];

	const {
		enhance: createProjectEnhance,
		form: createProjectForm,
		errors: createProjectErrors,
		message,
		delayed: createProjectDelayed
	} = superForm(data.createProjectFormData, {
		resetForm: true,
		taintedMessage: null,
		validators: zod(CreateProjectZodSchema),

		onUpdated: async () => {
			if (!$message) return;

			const { alertType, alertText } = $message;

			if (alertType === 'error') {
				toast.error(alertText);
			}

			if (alertType === 'success') {
				toast.success(alertText);
				try {
					const response = await fetch('/protected/projects');
					if (response.ok) {
						const updatedData = await response.json();
						newProjects = updatedData.allProjects;
					} else {
						console.error('Failed to fetch updated projects');
					}
				} catch (error) {
					console.error('Error fetching updated projects:', error);
				}

				goto('/protected/projects');
			}
		}
	});

	const mySelectionHandler = (event: string) => {
		const ID = event;
		goto(`/protected/project/${ID}`);
	};

	const handleDeleteProject = async (ID: string) => {
    const response = await fetch(`/protected/project/${ID}`, {
      method: 'DELETE',
    });

    if (response.ok) {
		toast.success('Deleted project successfully');
		 newProjects = newProjects.filter(project => project.id !== ID);
		} else {
			toast.error('Failed to delete project');
		}
		return newProjects.length === 0 ? newProjects.length : newProjects;
	}
</script>

<section class="flex flex-col gap-4">
	<h1 class="text-2xl">Recently Updated:</h1>
	{#if newProjects.length === 0}
		<h1 class="mb-5 text-lg">{data.message ? data.message : 'No project found. Please create a new project.'}</h1>
	{/if}
		{#each newProjects as project}
			<Card class="my-2 w-96 p-6">
				<DeleteProject projectId={project?.id} on:confirmDelete={()=> handleDeleteProject(project.id)} />
				<div class="flex flex-col gap-4">
					<div class="flex justify-between px-4">
						<span class="font-bold">Project Name: </span>
						<p class="inline pl-12">{project?.name}</p>
					</div>
					<div class="flex justify-between px-4">
						<span class="font-bold">Project Details: </span>
						<p class="inline pl-12">{project?.details}</p>
					</div>
					<div class="flex justify-between px-4">
						<span class="font-bold">Current Balance: </span>
						<p class="inline pl-12">{project?.totalFunds}</p>
					</div>
					<div class="flex justify-between px-4">
						<span class="font-bold">Date Created: </span>
						<p class="inline pl-12">{project?.createdAt}</p>
					</div>
					<Button variant={'outline'} on:click={() => mySelectionHandler(project.id)}>Go to Project</Button>
				</div>
			</Card>
		{/each}
</section>

<!-- <SuperDebug data={$createProjectForm} /> -->
<div class="my-8 flex flex-wrap justify-between gap-4">
	<Dialog.Root>
		<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>Create Project</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Create a new project?</Dialog.Title>
				<Dialog.Description>
					Input all the necessary information to create a new project.
				</Dialog.Description>
			</Dialog.Header>

			<form
				method="post"
				use:createProjectEnhance
				action={route('createProject /protected/projects')}
				class="space-y-4"
			>
				<InputField
					type="text"
					name="name"
					label="Project Name"
					bind:value={$createProjectForm.name}
					errorMessage={$createProjectErrors.name}
					maxlength={maxNameLen}
					minlength={minNameLen}
				/>
				<InputField
					type="text"
					name="details"
					label="Project Details"
					bind:value={$createProjectForm.details}
					errorMessage={$createProjectErrors.details}
					maxlength={maxNameLen}
					minlength={minNameLen}
				/>
				<InputField
					type="number"
					name="startingFunds"
					label="Initial Amount"
					step="0.01"
					bind:value={$createProjectForm.startingFunds}
					errorMessage={$createProjectErrors.startingFunds}
				/>

				<SubmitButton disabled={$createProjectDelayed}>Create A New Project</SubmitButton>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>
