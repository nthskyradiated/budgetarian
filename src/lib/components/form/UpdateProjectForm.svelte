<script lang="ts">
import * as Dialog from '$lib/components/ui/dialog';
	import { maxNameLen, minNameLen } from '@/lib/zodValidators/zodParams';
	import InputField from './InputField.svelte';
	import { buttonVariants } from '../ui/button';
	import SubmitButton from './SubmitButton.svelte';
    import { zod } from 'sveltekit-superforms/adapters';
    // import { toast } from 'svelte-sonner';
	import { superForm, type SuperValidated } from 'sveltekit-superforms/client';
    import { ProjectZodSchemaWithId, type projectZodSchemaWithId } from '@/lib/zodValidators/zodProjectValidation';
    export let updateProjectFormData: SuperValidated<projectZodSchemaWithId>;
	export let updateProjectFormAction: string;
    export let dialogName: string;
    export let dialogTitle: string;
    export let dialogDescription: string;
    export let projectId: string
	const {
		enhance: updateProjectFormEnhance,
		form: updateProjectForm,
		errors: updateProjectErrors,
		delayed: updateProjectDelayed,

	} = superForm(updateProjectFormData, {
		resetForm: true,
		taintedMessage: null,
		validators: zod(ProjectZodSchemaWithId),
		id: "updateProjectForm"

	});
</script>


<div class="my-8 flex flex-wrap justify-between gap-4">
	<Dialog.Root>
		<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>{dialogName}</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>{dialogTitle}</Dialog.Title>
				<Dialog.Description>
					{dialogDescription}
				</Dialog.Description>
			</Dialog.Header>

			<form
				method="post"
				use:updateProjectFormEnhance
				action={updateProjectFormAction}
				class="space-y-4"
			>
				<InputField
					type="text"
					name="name"
					label="Project Name"
					bind:value={$updateProjectForm.name}
					errorMessage={$updateProjectErrors.name}
					maxlength={maxNameLen}
					minlength={minNameLen}
				/>
				<InputField
					type="text"
					name="details"
					label="Project Details"
					bind:value={$updateProjectForm.details}
					errorMessage={$updateProjectErrors.details}
					maxlength={maxNameLen}
					minlength={minNameLen}
				/>
				<InputField
					type="number"
					name="startingFunds"
					label="Initial Amount"
					step="0.01"
					bind:value={$updateProjectForm.startingFunds}
					errorMessage={$updateProjectErrors.startingFunds}
				/>

				<InputField
				type="hidden"
				name="id"
				bind:value={projectId}
				/>


				<SubmitButton disabled={$updateProjectDelayed}>Create A New Project</SubmitButton>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>