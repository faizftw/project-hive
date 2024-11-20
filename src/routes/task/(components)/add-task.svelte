<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { CirclePlus, Calendar, Clock } from 'lucide-svelte';
</script>

<Dialog.Root>
  <Dialog.Trigger>
    <Button class='py-0 ml-auto me-2' size="sm">
        <CirclePlus class="mr-2 h-4 w-4" />
        Add Task
    </Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
      <Dialog.Description>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>