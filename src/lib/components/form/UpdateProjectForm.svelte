<script lang="ts">
import * as Dialog from '$lib/components/ui/dialog';
	import { maxNameLen, minNameLen } from '@/lib/zodValidators/zodParams';
	import InputField from './InputField.svelte';
	import { buttonVariants } from '../ui/button';
	import SubmitButton from './SubmitButton.svelte';
    import { zod } from 'sveltekit-superforms/adapters';
    // import { toast } from 'svelte-sonner';
	import { superForm, type SuperValidated } from 'sveltekit-superforms/client';
    import { UpdateProjectZodSchema, type updateProjectZodSchema } from '@/lib/zodValidators/zodProjectValidation';
    export let updateProjectFormData: SuperValidated<updateProjectZodSchema>;
	export let updateProjectFormAction: string;
    export let dialogName: string;
    export let dialogTitle: string;
    export let dialogDescription: string;
    export let projectId: string
    export let updateFundsPlaceHolder: number
    export let nameDefaultVal: string
    export let detailsDefaultVal: string
	let additionalClasses = 'w-full transform -translate-y-10';
	const {
		enhance: updateProjectFormEnhance,
		form: updateProjectForm,
		errors: updateProjectErrors,
		delayed: updateProjectDelayed,

	} = superForm(updateProjectFormData, {
		resetForm: true,
		taintedMessage: null,
		validators: zod(UpdateProjectZodSchema),
		id: "updateProjectForm"

	});
</script>


<div class="my-8 flex flex-wrap justify-between gap-4">
	<Dialog.Root>
		<Dialog.Trigger class={`${buttonVariants({ variant: 'outline' })} ${additionalClasses}`}>{dialogName}</Dialog.Trigger>
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
					value={$updateProjectForm.name}
					errorMessage={$updateProjectErrors.name}
					maxlength={maxNameLen}
					minlength={minNameLen}
					placeholder={nameDefaultVal}

					/>
					<InputField
					type="text"
					name="details"
					label="Project Details"
					value={$updateProjectForm.details}
					errorMessage={$updateProjectErrors.details}
					maxlength={maxNameLen}
					minlength={minNameLen}
					placeholder={detailsDefaultVal}

					/>
					<InputField
					type="number"
					name="startingFunds"
					label="Initial Amount"
					step="0.01"
					placeholder={updateFundsPlaceHolder.toString()}
					value={$updateProjectForm.startingFunds}
					errorMessage={$updateProjectErrors.startingFunds}

				/>

				<InputField
				type="hidden"
				name="id"
				bind:value={projectId}
				/>

				<SubmitButton disabled={$updateProjectDelayed}>Update Project</SubmitButton>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>