<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import type { Project } from '$lib/types';
  import { projectsStore } from '$lib/stores/projects';
  import CalendarIcon from 'lucide-svelte/icons/calendar';
  import type { DateValue } from '@internationalized/date';
  import { Calendar } from '$lib/components/ui/calendar/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import { createEventDispatcher } from 'svelte';
  import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
  import { DateFormatter } from '@internationalized/date';
  import { toast } from 'svelte-sonner';
import { CrossCircled } from 'svelte-radix';
import * as Alert from '$lib/components/ui/alert/index.js';

  interface Props {
    project: Project;
    open?: boolean;
  }

  let { project = $bindable(), open = $bindable(false) }: Props = $props();

  const dispatch = createEventDispatcher<{
    projectUpdated: { project: Project };
  }>();
  
  let isSubmitting = $state(false);
let dateValue: DateValue | null = $state(null);
let timeValue = $state('');
let name = $state('');
let description = $state('');
let status = $state('');
let formattedDateTime: string | null = $state(null);
let errorMessage = $state('');
let showAlert = $state(false);



  function resetForm() {
    name = project.name;
    description = project.description || '';
    status = project.status;
    
    if (project.dueDate) {
      try {
        const date = new Date(project.dueDate);
        const dateStr = date.toISOString().split('T')[0];
        dateValue = parseDate(dateStr);
        timeValue = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } catch (err) {
        console.error('Error parsing date:', err);
        dateValue = null;
        timeValue = '';
      }
    } else {
      dateValue = null;
      timeValue = '';
    }
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    isSubmitting = true;

    // Validasi nama project
    if (!name.trim()) {
      errorMessage = 'Nama proyek harus diisi';
      showAlert = true;
      isSubmitting = false;
      return;
    }

    // Gabungkan dateValue dan timeValue menjadi objek Date
    let selectedDateTime: Date | null = null;
    if (dateValue && timeValue) {
      try {
        const date = dateValue.toDate(getLocalTimeZone());
        const [hours, minutes] = timeValue.split(':');
        date.setHours(parseInt(hours));
        date.setMinutes(parseInt(minutes));
        selectedDateTime = date;
      } catch (err) {
        console.error('Error formatting date time:', err);
        selectedDateTime = null;
      }
    } else {
      errorMessage = 'Tanggal dan waktu deadline proyek wajib diisi';
      showAlert = true;
      isSubmitting = false;
      return;
    }

    // Validasi apakah deadline tidak di masa lalu
    if (selectedDateTime && selectedDateTime < new Date()) {
      errorMessage = 'Deadline tidak boleh di masa lalu';
      showAlert = true;
      isSubmitting = false;
      return;
    }

    try {
      const form = new FormData();
      form.append('id', project.id);
      form.append('name', name.trim());
      form.append('description', description.trim());
      form.append('status', status);
      form.append('dueDate', formattedDateTime || '');

      const response = await fetch('?/updateProject', {
        method: 'POST',
        body: form
      });

      const result = await response.json();
      console.log('Raw server response:', result);

      if (result.type === 'success') {
        const parsedData = JSON.parse(result.data);
        
        const updatedProject: Project = {
          id: parsedData[3],
          name: parsedData[4],
          description: parsedData[5],
          status: parsedData[6],
          dueDate: parsedData[7],
          createdAt: parsedData[8],
          createdById: parsedData[9],
          createdBy: {
            id: parsedData[9],
            name: parsedData[11],
            email: parsedData[12]
          }
        };

        if (!updatedProject.id || !updatedProject.name) {
          throw new Error('Invalid project data received from server');
        }

        projectsStore.updateProject(updatedProject);
        project = updatedProject;
        dispatch('projectUpdated', { project: updatedProject });
        toast.success('Proyek berhasil diperbarui');
        open = false;
      } else {
        throw new Error(result.error || 'Gagal memperbarui proyek');
      }
    } catch (err) {
      console.error('Error updating project:', err);
      errorMessage = `Gagal memperbarui proyek: ${err.message}`;
      showAlert = true;
    } finally {
      isSubmitting = false;
    }
  }

  // Tetapkan tanggal minimum sebagai hari ini
  let minDate = today(getLocalTimeZone());
  // Reset form saat dialog dibuka
  $effect(() => {
    if (open) {
      resetForm();
    }
  });
  // Reactive statement untuk format tanggal
  $effect(() => {
    if (dateValue && timeValue) {
      try {
        const date = dateValue.toDate(getLocalTimeZone());
        const [hours, minutes] = timeValue.split(':');
        date.setHours(parseInt(hours));
        date.setMinutes(parseInt(minutes));
        formattedDateTime = date.toISOString();
      } catch (err) {
        console.error('Error formatting date time:', err);
        formattedDateTime = null;
      }
    } else {
      formattedDateTime = null;
    }
  });
</script>

<Dialog.Root bind:open>
  
  <Dialog.Content class="inline-block" portalProps={{}}>
    <Dialog.Header class="space-y-2">
      <Dialog.Title class="text-xl font-semibold">Edit Proyek</Dialog.Title>
      <Dialog.Description class="text-sm text-muted-foreground">
        Edit detail proyek di sini. Klik save setelah selesai.
      </Dialog.Description>
    </Dialog.Header>
    
    {#if showAlert}
      <Alert.Root variant="destructive">
        <CrossCircled class="h-4 w-4" />
        <Alert.Title>Error</Alert.Title>
        <Alert.Description>{errorMessage}</Alert.Description>
      </Alert.Root>
    {/if}

    <form onsubmit={handleSubmit}>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="name" class="text-right">Nama</Label>
          <Input 
            id="name" 
            type="text"
            bind:value={name}
            placeholder="Nama Proyek" 
            class="col-span-3" 
            required 
          />
        </div>
        
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="description" class="text-right">Deskripsi</Label>
          <Input 
            id="description" 
            type="text"
            bind:value={description}
            placeholder="Deskripsi Proyek" 
            class="col-span-3" 
          />
        </div>

        <div class="grid grid-cols-4 items-center gap-4">
          <Label class="text-right">Deadline</Label>
          <div class="col-span-3 flex gap-2">
            <Popover.Root>
              <Popover.Trigger>
                {#snippet child({ props })}
                <Button variant="outline" class="w-[240px] justify-start text-left font-normal" {...props}>
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {#if dateValue}
                    {new DateFormatter('id-ID', { dateStyle: 'long' }).format(dateValue.toDate(getLocalTimeZone()))}
                  {:else}
                    Pilih tanggal
                  {/if}
                </Button>
                {/snippet}
              </Popover.Trigger>
              <Popover.Content class="w-auto p-0" portalProps={{}}>
                <Calendar 
                  mode="single" 
                  bind:value={dateValue} 
                  selected={dateValue} 
                  minDate={minDate}
                  class="border rounded-md" 
                />
              </Popover.Content>
            </Popover.Root>
            
            <Input
              type="time"
              class="w-[120px]"
              bind:value={timeValue}
            />
          </div>
        </div>
      </div>
      
      <Dialog.Footer class="flex justify-end space-x-2">
        <Button type="button" variant="outline" onclick={() => (open = false)} class=''>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} class=''>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
