<script>
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
  import { CheckSquare, FolderKanban } from "lucide-svelte";

  export let tasksCount = 0;
  export let projectsCount = 0;
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
          {Math.round(tasksCount * 0.75)} completed, {Math.round(tasksCount * 0.25)} pending
        {:else}
          No tasks
        {/if}
      </p>
      <div class="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
        <div class="h-full bg-primary" style="width: {tasksCount > 0 ? 75 : 0}%" ></div>
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
          {Math.round(projectsCount * 0.3)} active, {Math.round(projectsCount * 0.7)} completed
        {:else}
          No projects
        {/if}
      </p>
      <div class="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
        <div class="h-full bg-primary" style="width: {projectsCount > 0 ? 30 : 0}%" ></div>
      </div>
    </CardContent>
  </Card>
</div> 