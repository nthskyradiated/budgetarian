<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';

	// import { zod } from 'sveltekit-superforms/adapters';
	// import { ProjectZodSchema } from '@/lib/zodValidators/zodProjectValidation';
	import { route } from '@/lib/router';
	import { toast } from 'svelte-sonner';
	import { Button } from '@/lib/components/ui/button';
	import { goto } from '$app/navigation';
	import Card from '@/lib/components/ui/card/card.svelte';
	import DeleteProject from '@/lib/components/DeleteProject.svelte';
	import CreateProjectForm from '@/lib/components/form/CreateProjectForm.svelte';
	import UpdateProjectForm from '@/lib/components/form/UpdateProjectForm.svelte';

	const { data } = $props();
	const {allProjects = [], createProjectFormData, updateProjectFormData} = data

	let newProjects = $state([...allProjects]);

	const { message } = superForm(createProjectFormData, {
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
	},
	);

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
					<div class="flex justify-between px-4">
						<span class="font-bold">Project Id: </span>
						<p class="inline pl-12">{project?.id}</p>
					</div>
					<Button variant={'outline'} on:click={() => mySelectionHandler(project.id)}>Go to Project</Button>
				</div>
				<UpdateProjectForm 
					dialogName="Update Project"
					dialogDescription="Input all the necessary information to update a project."
					dialogTitle="Update project?"
					updateProjectFormData={updateProjectFormData}
					updateProjectFormAction={route("updateProject /protected/projects")}
					projectId={project?.id}
					/>
			</Card>
		{/each}
</section>

<CreateProjectForm 
	dialogName="Create Project"
	dialogDescription="Input all the necessary information to create a new project."
	dialogTitle="Create a new project?"
	createProjectFormData={createProjectFormData}
	createProjectFormAction={route("createProject /protected/projects")}
/>



<!-- <SuperDebug data={$createProjectForm} /> -->
<!-- <div class="my-8 flex flex-wrap justify-between gap-4">
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
</div> -->
