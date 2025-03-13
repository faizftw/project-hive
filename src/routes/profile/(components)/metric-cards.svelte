<script>
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
  import { CheckSquare, FolderKanban } from "lucide-svelte";

  const { 
    // Task data
    tasksCount = 0, 
    completedTasksCount = 0,
    inProgressTasksCount = 0,
    todoTasksCount = 0,
    backlogTasksCount = 0,
    canceledTasksCount = 0,
    pendingTasksCount = 0,
    
    // Project data
    projectsCount = 0, 
    activeProjectsCount = 0,
    completedProjectsCount = 0,
    cancelledProjectsCount = 0,
    onHoldProjectsCount = 0
  } = $props();

  // Menggunakan data aktual dari server
  const pendingTasks = $derived(tasksCount - completedTasksCount);
  const completedProjects = $derived(projectsCount - activeProjectsCount);

  // Progress percentages sesuai data aktual
  const taskProgressPercentage = $derived(tasksCount > 0 ? Math.round((completedTasksCount / tasksCount) * 100) : 0);
  const projectProgressPercentage = $derived(projectsCount > 0 ? Math.round((activeProjectsCount / projectsCount) * 100) : 0);
</script>

<div class="grid gap-4 md:grid-cols-2">
  <Card class="overflow-hidden">
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium">Total Tasks</CardTitle>
      <CheckSquare class="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent class="p-4">
      <div class="text-2xl font-bold">{tasksCount}</div>
      <div class="text-xs text-muted-foreground space-y-1">
        {#if tasksCount > 0}
          <div class="grid grid-cols-2 gap-1">
            <div>
              <span class="font-medium text-green-500">{completedTasksCount}</span> completed
            </div>
            <div>
              <span class="font-medium text-blue-500">{inProgressTasksCount}</span> in progress
            </div>
            <div>
              <span class="font-medium text-amber-500">{todoTasksCount}</span> todo
            </div>
            <div>
              <span class="font-medium text-purple-500">{backlogTasksCount}</span> backlog
            </div>
            <div>
              <span class="font-medium text-red-500">{canceledTasksCount}</span> canceled
            </div>
            <div>
              <span class="font-medium text-gray-500">{pendingTasksCount}</span> pending
            </div>
          </div>
        {:else}
          No tasks
        {/if}
      </div>
      <div class="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
        <div class="h-full bg-primary" style="width: {taskProgressPercentage}%" ></div>
      </div>
    </CardContent>
  </Card>

  <Card class="overflow-hidden">
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium">Total Projects</CardTitle>
      <FolderKanban class="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent class="p-4">
      <div class="text-2xl font-bold">{projectsCount}</div>
      <div class="text-xs text-muted-foreground space-y-1">
        {#if projectsCount > 0}
          <div class="grid grid-cols-2 gap-1">
            <div>
              <span class="font-medium text-blue-500">{activeProjectsCount}</span> active
            </div>
            <div>
              <span class="font-medium text-green-500">{completedProjectsCount}</span> completed
            </div>
            <div>
              <span class="font-medium text-red-500">{cancelledProjectsCount}</span> cancelled
            </div>
            <div>
              <span class="font-medium text-amber-500">{onHoldProjectsCount}</span> on hold
            </div>
          </div>
        {:else}
          No projects
        {/if}
      </div>
      <div class="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
        <div class="h-full bg-primary" style="width: {projectProgressPercentage}%" ></div>
      </div>
    </CardContent>
  </Card>
</div> 