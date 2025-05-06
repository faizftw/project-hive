<script lang="ts">
  import DataTable from './(components)/data-table.svelte';
  import type { PageData } from './$types';
  import { tasksStore } from '$lib/stores/tasks';
  import { projectsStore } from '$lib/stores/projects';
  import { onMount } from 'svelte';
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import AppSidebar from "./(components)/app-sidebar.svelte";
  import type { Project } from '$lib/types';
  import AddTask from './(components)/add-task.svelte';
  import { page } from '$app/stores';
  import EditTask from './(components)/edit-task.svelte';

  let { data }: { data: PageData } = $props();

  let projectTitle = $derived(data?.project?.name || 'Tasks');
  let projectId = $derived(data?.project?.id || '');
  let tasks = $derived(data?.tasks || []);

  // Tambahkan task data ke store
  $effect(() => {
    if (tasks?.length > 0) {
      tasksStore.set(tasks);
    }
  });

  onMount(() => {
    tasksStore.set(data.tasks);
    if (data.project) {
      const project: Project = {
        ...data.project,
        createdBy: data.project.createdBy || {
          id: data.project.createdById,
          name: 'Unknown',
          email: ''
        },
        dueDate: data.project.dueDate ? data.project.dueDate.toString() : null
      };
      projectsStore.addProject(project);
    }

    // Periksa task yang melewati deadline
    tasksStore.checkOverdue();
    
    // Set interval untuk memeriksa status overdue secara berkala (setiap 1 jam)
    const interval = setInterval(() => {
      tasksStore.checkOverdue();
    }, 60 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
    };
  });
</script>

<Sidebar.Provider style="--sidebar-width: 19rem;">
<AppSidebar projectId={data.project?.id ?? ''} />
<Sidebar.Inset>
<div class="min-h-screen flex-1 flex-col space-y-4 p-3 md:space-y-8 md:p-8 md:flex">
  <div class="flex items-center justify-between space-y-2">
      <div>
          <div class="flex items-center space-x-2 mb-5">
            <Sidebar.Trigger class="-ml-1"/>
              <Breadcrumb.Root>
                  <Breadcrumb.List>
                <Breadcrumb.Item>
                  <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                  <Breadcrumb.Page>Task</Breadcrumb.Page>
                </Breadcrumb.Item>
              </Breadcrumb.List>
            </Breadcrumb.Root>
          </div>
          <h2 class="text-2xl font-bold tracking-tight">Proyek {data.project?.name}</h2>
          <p class="text-muted-foreground"> Daftar tugas untuk proyek ini</p>
      </div>
  </div>
  <DataTable projectId={data.project?.id ?? ''} />
</div>
</Sidebar.Inset>
</Sidebar.Provider>