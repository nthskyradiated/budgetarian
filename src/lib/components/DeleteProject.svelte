<script lang="ts">
import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
	import { createEventDispatcher } from "svelte";

  export let projectId;

  const dispatch = createEventDispatcher();

const confirmDelete = () => {
  dispatch('confirmDelete', projectId);
};

</script>


<AlertDialog.Root>
    <AlertDialog.Trigger asChild let:builder>
      <Button builders={[builder]} variant="destructive" size="icon" class="rounded-full">x</Button>
    </AlertDialog.Trigger>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Are you sure?</AlertDialog.Title>
        <AlertDialog.Description>
          This action cannot be undone. This will permanently delete your project
          and remove your data from our servers.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
        <AlertDialog.Action on:click={confirmDelete}>Continue</AlertDialog.Action>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>