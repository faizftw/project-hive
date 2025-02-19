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
    }

    // Validasi apakah deadline tidak di masa lalu
    if (selectedDateTime && selectedDateTime < new Date()) {
      alert('Deadline tidak boleh berada di masa lalu.');
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
          throw new Error('Data project tidak valid dari server');
        }

        projectsStore.updateProject(updatedProject);
        project = updatedProject;
        dispatch('projectUpdated', { project: updatedProject });
        open = false;
      } else {
        throw new Error(result.error || 'Gagal mengupdate project');
      }
    } catch (err) {
      console.error('Error updating project:', err);
      alert('Gagal mengupdate project. Silakan coba lagi.');
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
  
  <Dialog.Content class="inline-block">
    <Dialog.Header>
      <Dialog.Title>Edit Project</Dialog.Title>
      <Dialog.Description>
        Edit project details here. Click save after finishing.
      </Dialog.Description>
    </Dialog.Header>

    <form onsubmit={handleSubmit}>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="name" class="text-right">Name</Label>
          <Input 
            id="name" 
            bind:value={name}
            placeholder="Project Name" 
            class="col-span-3" 
            required 
          />
        </div>
        
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="description" class="text-right">Description</Label>
          <Input 
            id="description" 
            bind:value={description}
            placeholder="Project Description" 
            class="col-span-3" 
          />
        </div>

        <div class="grid grid-cols-4 items-center gap-4">
          <Label class="text-right">Status</Label>
          <select 
            bind:value={status} 
            class="col-span-3 p-2 border rounded"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>

        <div class="grid grid-cols-4 items-center gap-4">
          <Label class="text-right">Due Date</Label>
          <div class="col-span-3 flex gap-2">
            <Popover.Root>
              <Popover.Trigger>
                <Button variant="outline" class="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {#if dateValue}
                    {new DateFormatter('id-ID', { dateStyle: 'long' }).format(dateValue.toDate(getLocalTimeZone()))}
                  {:else}
                    Choose a date
                  {/if}
                </Button>
              </Popover.Trigger>
              <Popover.Content class="w-auto p-0">
                <Calendar mode="single" bind:value={dateValue} selected={dateValue} minDate={minDate} />
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
      
      <Dialog.Footer>
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
