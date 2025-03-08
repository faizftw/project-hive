<script>
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
  import { CheckSquare, FolderKanban } from "lucide-svelte";

  const { tasksCount = 0, projectsCount = 0 } = $props();

  // Derived values for completed/pending tasks
  const completedTasks = $derived(Math.round(tasksCount * 0.75));
  const pendingTasks = $derived(Math.round(tasksCount * 0.25));

  // Derived values for active/completed projects
  const activeProjects = $derived(Math.round(projectsCount * 0.3));
  const completedProjects = $derived(Math.round(projectsCount * 0.7));

  // Progress percentages
  const taskProgressPercentage = $derived(tasksCount > 0 ? 75 : 0);
  const projectProgressPercentage = $derived(projectsCount > 0 ? 30 : 0);
</script>

<div class="grid gap-4 md:grid-cols-2">
  <Card class="overflow-hidden">
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium">Total Tasks</CardTitle>
      <CheckSquare class="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div class="text-2xl font-bold">{tasksCount}</div>
      <p class="text-xs text-muted-foreground">
        {#if tasksCount > 0}
          {completedTasks} completed, {pendingTasks} pending
        {:else}
          No tasks
        {/if}
      </p>
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
    <CardContent>
      <div class="text-2xl font-bold">{projectsCount}</div>
      <p class="text-xs text-muted-foreground">
        {#if projectsCount > 0}
          {activeProjects} active, {completedProjects} completed
        {:else}
          No projects
        {/if}
      </p>
      <div class="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
        <div class="h-full bg-primary" style="width: {projectProgressPercentage}%" ></div>
      </div>
    </CardContent>
  </Card>
</div> 