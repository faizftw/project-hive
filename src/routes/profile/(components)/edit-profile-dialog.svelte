<script>
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "$lib/components/ui/dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { CrossCircled } from 'svelte-radix';
  import * as Alert from '$lib/components/ui/alert/index.js';
  import { createEventDispatcher } from 'svelte';

  // Props using runes
  const { user, onUpdate, open = false } = $props();

  // State with runes
  let name = $state(user?.name || '');
  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');
  let isSubmitting = $state(false);
  let errors = $state({});
  let serverError = $state('');
  const dispatch = createEventDispatcher(); 
  // Update name when user prop changes
  $effect(() => {
    if (user && user.name) {
      name = user.name;
    }
  });

  // Form data derived from state
  const formData = $derived({
    name,
    currentPassword,
    newPassword,
    confirmPassword
  });

  function handleChange(e) {
    const { name: fieldName, value } = e.target;
    
    // Update the corresponding variable
    if (fieldName === 'name') name = value;
    if (fieldName === 'currentPassword') currentPassword = value;
    if (fieldName === 'newPassword') newPassword = value;
    if (fieldName === 'confirmPassword') confirmPassword = value;

    // Clear error when user types
    if (errors[fieldName]) {
      errors = {...errors, [fieldName]: ""};
    }
  }

  function validateForm() {
  const newErrors = {};

  if (!formData.name.trim()) {
    newErrors.name = "Name cannot be empty";
  }

  // Only validate password fields if the user is trying to change password
  if (formData.newPassword) {
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (formData.newPassword.length < 8) {
      newErrors.newPassword = "New password must be at least 8 characters";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "New password and confirmation do not match";
    }
  }

  errors = newErrors;
  return Object.keys(newErrors).length === 0;
}

  async function handleSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  // Reset server error
  serverError = '';

  // Collect data to be sent
  const updatedData = {
    name: formData.name
  };

  // Add password data if filled
  if (formData.newPassword) {
    updatedData.currentPassword = formData.currentPassword;
    updatedData.newPassword = formData.newPassword;
    updatedData.confirmPassword = formData.confirmPassword; // Kirim untuk validasi di server
  }

  isSubmitting = true;
  try {
    // Call the update function passed from parent component
    await onUpdate(updatedData);
    
    // Reset password fields
    currentPassword = "";
    newPassword = "";
    confirmPassword = "";
    
    // Close dialog
    const event = new CustomEvent('update:open', { detail: false });
    dispatchEvent(event);
  } catch (error) {
    console.error("Error updating profile:", error);
    serverError = error.message || "Failed to update profile";
  } finally {
    isSubmitting = false;
  }
}

  // Handle dialog state change
  function handleDialogChange(isOpen) {
    if (!isOpen) {
      currentPassword = "";
      newPassword = "";
      confirmPassword = "";
      errors = {};
    }
    dispatch('update:open', isOpen);
  }
</script>

<Dialog {open} onOpenChange={handleDialogChange}>
  <DialogContent class="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
    </DialogHeader>
    {#if serverError}
      <Alert.Root variant="destructive">
        <CrossCircled class="h-4 w-4" />
        <Alert.Title>Error</Alert.Title>
        <Alert.Description>{serverError}</Alert.Description>
      </Alert.Root>
    {/if}
    <form onsubmit={handleSubmit} class="space-y-4 py-4">
      <div class="space-y-2">
        <Label for="name" class="font-medium">Username</Label>
        <Input id="name" name="name" value={name} oninput={handleChange} class="w-full" />
        {#if errors.name}
          <p class="text-sm text-destructive">{errors.name}</p>
        {/if}
      </div>

      <div class="pt-4 border-t">
        <h4 class="text-sm font-medium mb-4">Change Password</h4>

        <div class="space-y-2">
          <Label for="currentPassword" class="font-medium">Current Password</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={currentPassword}
            oninput={handleChange}
            class="w-full"
          />
          {#if errors.currentPassword}
            <p class="text-sm text-destructive">{errors.currentPassword}</p>
          {/if}
        </div>

        <div class="space-y-2 mt-2">
          <Label for="newPassword" class="font-medium">New Password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            value={newPassword}
            oninput={handleChange}
            class="w-full"
          />
          {#if errors.newPassword}
            <p class="text-sm text-destructive">{errors.newPassword}</p>
          {/if}
        </div>

        <div class="space-y-2 mt-2">
          <Label for="confirmPassword" class="font-medium">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            oninput={handleChange}
            class="w-full"
          />
          {#if errors.confirmPassword}
            <p class="text-sm text-destructive">{errors.confirmPassword}</p>
          {/if}
        </div>
      </div>

      <DialogFooter class="gap-2">
        <Button type="submit" disabled={isSubmitting} class="w-full sm:w-auto">
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog> 