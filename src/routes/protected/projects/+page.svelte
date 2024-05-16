<script lang="ts">
	import { route } from '@/lib/router';
    import type { PageData } from './$types';
	import SubmitButton from '@/lib/components/form/SubmitButton.svelte';
    import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms/client';
    import * as Dialog from '$lib/components/ui/dialog';
	import InputField from '@/lib/components/form/InputField.svelte';
	import { buttonVariants } from '@/lib/components/ui/button';
    import { zod } from 'sveltekit-superforms/adapters';
	import { CreateProjectZodSchema } from '@/lib/zodValidators/zodProjectValidation';
	import { maxNameLen, minNameLen } from '@/lib/zodValidators/zodParams';
    // import SuperDebug from 'sveltekit-superforms';

    export let data: PageData 
    
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
 
        })



</script>
<!-- {#each projects as project}
    <h1>{project?.id}</h1>
{/each}
<h1>{data.projects}</h1> -->
<!-- <SuperDebug data={$createProjectForm} /> -->
<div class="flex flex-wrap justify-between gap-4">

    <Dialog.Root>
        <Dialog.Trigger class={buttonVariants({ variant: 'default' })}>
            Create Project
        </Dialog.Trigger>
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
                action='?/createProject'
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
            name="totalFunds"
            label="Total Funds"
            bind:value={$createProjectForm.totalFunds}
            errorMessage={$createProjectErrors.totalFunds}
        />

                <SubmitButton disabled={$createProjectDelayed}>Create A New Project</SubmitButton>
            </form>
        </Dialog.Content>
    </Dialog.Root>
</div>