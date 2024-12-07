<script lang="ts">
    import DataTable from './(components)/data-table.svelte';
    import type { PageData } from './$types';
    import { tasksStore } from '$lib/stores/tasks';
    import { onMount } from 'svelte';
    import * as Breadcrumb from "$lib/components/ui/breadcrumb";

    export let data: PageData;

    onMount(() => {
        tasksStore.set(data.tasks);
    });
</script>

<div class="h-full flex-1 flex-col space-y-8 p-8 md:flex">
    <div class="flex items-center justify-between space-y-2">
        <div>
            <div class="flex items-center space-x-2 mb-5">
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