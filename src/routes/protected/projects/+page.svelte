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
	import { maxNameLen } from '@/lib/zodValidators/zodParams';
    import SuperDebug from 'sveltekit-superforms';

    export let data: PageData 
    
    
    if (data.createProjectFormData){

     return {
         const {enhance,
         form,
         errors,
         message,
         delayed
     } = superForm(data.createProjectFormData, {
         createProjectForm: true,
         taintedMessage: null,
         validators: zod(CreateProjectZodSchema),

     }
    
        });
    }	// For password reset form
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

</script>
<!-- {#each projects as project}
    <h1>{project?.id}</h1>
{/each}
<h1>{data.projects}</h1> -->
<SuperDebug data={$form} />
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
                use:enhance
                action='?/createProject'
                class="space-y-4"
            >
            <label for="name">Name</label>
            <input type="text" name="name" bind:value={$form['name']} />
          
            <label for="details">details</label>
            <input type="text" name="details" bind:value={$form['details']} />
            <label for="totalFunds">funds</label>
            <input type="text" name="totalFunds" bind:value={$form['totalFunds']} />

                <SubmitButton disabled={$delayed}>Create A New Project</SubmitButton>
            </form>
        </Dialog.Content>
    </Dialog.Root>
</div>