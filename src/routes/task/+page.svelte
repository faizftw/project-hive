<script lang="ts">
  import DataTable from './(components)/data-table.svelte';
  import type { PageData } from './$types';
  import { tasksStore } from '$lib/stores/tasks';
  import { projectsStore } from '$lib/stores/projects';
  import { onMount } from 'svelte';
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import AppSidebar from "./(components)/app-sidebar.svelte";

  let { data }: { data: PageData } = $props();

  onMount(() => {
      tasksStore.set(data.tasks);
      if (data.project) {
          projectsStore.update(projects => {
              const existingProjectIndex = projects.findIndex(p => p.id === data.project.id);
              if (existingProjectIndex >= 0) {
                  projects[existingProjectIndex] = data.project;
                  return [...projects];
              } else {
                  return [...projects, data.project];
              }
          });
      }
  });
</script>

<Sidebar.Provider style="--sidebar-width: 19rem;">
<AppSidebar projectId={data.project?.id ?? ''} />
<Sidebar.Inset>
<div class="h-full flex-1 flex-col space-y-8 p-8 md:flex">
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
          <h2 class="text-2xl font-bold tracking-tight">Project {data.project?.name}</h2>
          <p class="text-muted-foreground"> Here are the tasks for this project</p>
      </div>
  </div>
  <DataTable projectId={data.project?.id ?? ''} />
</div>
</Sidebar.Inset>
</Sidebar.Provider>