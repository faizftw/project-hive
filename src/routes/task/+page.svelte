<script lang="ts">
	import DataTable from './(components)/data-table.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="h-full flex-1 flex-col space-y-8 p-8 md:flex">
	<div class="flex items-center justify-between space-y-2">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">Task untuk {data.project.name}</h2>
			<p class="text-muted-foreground">Berikut adalah daftar tugas untuk project ini!</p>
		</div>
	</div>
	<DataTable data={data.tasks} projectId={data.project.id} createdById={data.project.createdById} />
</div>
