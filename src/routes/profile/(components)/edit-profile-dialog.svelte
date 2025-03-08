<script>
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "$lib/components/ui/dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";

  export let onOpenChange;
  export let user;
  export let onUpdate;
  export let open;

  let name = user?.name || '';
  let currentPassword = "";
  let newPassword = "";
  let confirmPassword = "";
  let isSubmitting = false;

  // Reset form saat user berubah
  $: if (user && user.name) {
    name = user.name;
  }

  $: formData = {
    name,
    currentPassword,
    newPassword,
    confirmPassword
  };

  let errors = {};

  function handleChange(e) {
    const { name: fieldName, value } = e.target;
    
    // Update variabel yang sesuai
    if (fieldName === 'name') name = value;
    if (fieldName === 'currentPassword') currentPassword = value;
    if (fieldName === 'newPassword') newPassword = value;
    if (fieldName === 'confirmPassword') confirmPassword = value;

    // Hapus error saat user mengetik
    if (errors[fieldName]) {
      errors = {...errors, [fieldName]: ""};
    }
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama tidak boleh kosong";
    }

    // Validasi password hanya jika user mencoba mengubah password
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Password saat ini diperlukan";
      }

      if (formData.newPassword.length < 8) {
        newErrors.newPassword = "Password harus minimal 8 karakter";
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Password tidak cocok";
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

    // Kumpulkan data yang akan dikirim
    const updatedData = {
      name: formData.name
    };

    // Tambahkan data password jika diisi
    if (formData.newPassword) {
      updatedData.currentPassword = formData.currentPassword;
      updatedData.newPassword = formData.newPassword;
    }

    isSubmitting = true;
    try {
      // Panggil fungsi update yang dilewatkan dari komponen induk
      await onUpdate(updatedData);
      
      // Reset form password
      currentPassword = "";
      newPassword = "";
      confirmPassword = "";
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      isSubmitting = false;
    }
  }

  // Reset form saat dialog ditutup
  function handleDialogChange(isOpen) {
    if (!isOpen) {
      currentPassword = "";
      newPassword = "";
      confirmPassword = "";
      errors = {};
    }
    onOpenChange(isOpen);
  }
</script>

<Dialog bind:open onOpenChange={handleDialogChange}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
    </DialogHeader>
    <form on:submit={handleSubmit} class="space-y-4 py-4">
      <div class="space-y-2">
        <Label for="name">Username</Label>
        <Input id="name" name="name" value={name} oninput={handleChange} />
        {#if errors.name}
          <p class="text-sm text-destructive">{errors.name}</p>
        {/if}
      </div>

      <div class="pt-4 border-t">
        <h4 class="text-sm font-medium mb-4">Change Password</h4>

        <div class="space-y-2">
          <Label for="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={currentPassword}
            oninput={handleChange}
          />
          {#if errors.currentPassword}
            <p class="text-sm text-destructive">{errors.currentPassword}</p>
          {/if}
        </div>

        <div class="space-y-2 mt-2">
          <Label for="newPassword">New Password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            value={newPassword}
            oninput={handleChange}
          />
          {#if errors.newPassword}
            <p class="text-sm text-destructive">{errors.newPassword}</p>
          {/if}
        </div>

        <div class="space-y-2 mt-2">
          <Label for="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            oninput={handleChange}
          />
          {#if errors.confirmPassword}
            <p class="text-sm text-destructive">{errors.confirmPassword}</p>
          {/if}
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog> 