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
	const { allProjects = [], createProjectFormData, updateProjectFormData } = data;

	let newProjects = $state([...allProjects]);

	const { message } = superForm(createProjectFormData, {
		id: 'createProjectForm',
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
	const { message: updateProjectFormMessage } = superForm(updateProjectFormData, {
		id: 'updateProjectForm',
		onUpdated: async () => {
			if (!$updateProjectFormMessage) return;

			const { alertType, alertText } = $updateProjectFormMessage;

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
						console.error('Failed to fetch updated project');
					}
				} catch (error) {
					console.error('Error fetching updated project:', error);
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
			method: 'DELETE'
		});

		if (response.ok) {
			toast.success('Deleted project successfully');
			newProjects = newProjects.filter((project) => project.id !== ID);
		} else {
			toast.error('Failed to delete project');
		}
	};
</script>

<!-- done. do not touch! -->
<section class="mt-12 flex flex-col gap-1 mx-auto md:ml-12 w-80 md:w-full">
	<h1 class="text-2xl">Recently Updated:</h1>
	{#if newProjects.length === 0}
		<h1 class="mb-5 text-lg">
			{data.message ? data.message : 'No project found. Please create a new project.'}
		</h1>
	{/if}
	<CreateProjectForm
		dialogName="Create Project"
		dialogDescription="Input all the necessary information to create a new project."
		dialogTitle="Create a new project?"
		{createProjectFormData}
		createProjectFormAction={route('createProject /protected/projects')}
	/>
	{#each newProjects as project}
		<Card class="relative h-96 w-full p-6 sm:w-96">
			<DeleteProject
				projectId={project?.id}
				on:confirmDelete={() => handleDeleteProject(project.id)}
			/>
			<span class="items-end text-xl font-bold">{project?.name}</span>
			<div class="mt-8 flex flex-col gap-4">
				<hr class="w-full border-gray-400" />
				<div class="flex justify-between">
					<span class="font-bold">Project Details: </span>
					<p class="inline text-right">{project?.details}</p>
				</div>
				<div class="flex justify-between">
					<span class="font-bold">Current Balance: </span>
					<p class="inline text-right">{project?.totalFunds}</p>
				</div>
				<div class="flex justify-between">
					<span class="font-bold">Date Created: </span>
					<p class="inline text-right">{project?.createdAt}</p>
				</div>

				<Button variant={'outline'} class="mt-8" on:click={() => mySelectionHandler(project.id)}
					>Go to Project Page</Button
				>
				<UpdateProjectForm
					dialogName="Update Project"
					dialogDescription="Input all the necessary information to update a project."
					dialogTitle="Update project?"
					{updateProjectFormData}
					updateProjectFormAction={route('updateProject /protected/projects')}
					projectId={project?.id}
					updateFundsPlaceHolder={project?.totalFunds!}
					nameDefaultVal={project?.name!}
					detailsDefaultVal={project?.details!}
				/>
			</div>
		</Card>
	{/each}
</section>
