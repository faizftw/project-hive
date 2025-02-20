<script lang="ts">
	let { url }: { url: { url: string, alias: string | null } | null } = $props();
  </script>

  <div class="flex space-x-2">
	<span class="max-w-[500px] truncate font-medium">
       <a href={url?.url} target="_blank" rel="noopener noreferrer">{url?.alias}</a>
	</span>
  </div>