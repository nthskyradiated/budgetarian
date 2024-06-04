<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { maxNameLen, minNameLen } from '@/lib/zodValidators/zodParams';
	import InputField from './InputField.svelte';
	import { buttonVariants } from '../ui/button';
	import SubmitButton from './SubmitButton.svelte';
	import { zod } from 'sveltekit-superforms/adapters';
	import { superForm, type SuperValidated } from 'sveltekit-superforms/client';
	import {
		ProjectZodSchema,
		type projectZodSchema
	} from '@/lib/zodValidators/zodProjectValidation';
	let {
		createProjectFormData,
		createProjectFormAction,
		dialogName,
		dialogTitle,
		dialogDescription
	} = $props<{
		createProjectFormData: SuperValidated<projectZodSchema>;
		createProjectFormAction: string;
		dialogName: string;
		dialogTitle: string;
		dialogDescription: string;
	}>();

	let open = $state(false);

	const {
		enhance: createProjectFormEnhance,
		form: createProjectForm,
		errors: createProjectErrors,
		delayed: createProjectDelayed
	} = superForm(createProjectFormData, {
		resetForm: true,
		taintedMessage: null,
		validators: zod(ProjectZodSchema),
		id: 'createProjectForm',
		onUpdate: (createProjectForm) => {
			if (createProjectForm.result?.type === 'success') {
				open = false;
			}
		}
	});
</script>

<div class="my-8 flex flex-wrap justify-between gap-4">
	<Dialog.Root bind:open>
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
				use:createProjectFormEnhance
				action={createProjectFormAction}
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
