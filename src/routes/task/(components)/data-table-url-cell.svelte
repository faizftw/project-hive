<script lang="ts">
	export let url: string | { url: string; alias: string | null } | null;
	
	// Parse URL jika dalam bentuk string
	const parsedUrl = typeof url === 'string' ? JSON.parse(url) : url;
</script>

<div class="flex space-x-2">
  <span class="max-w-[500px] truncate font-medium">
	{#if parsedUrl?.url}
		<a 
			href={parsedUrl.url} 
			target="_blank" 
			rel="noopener noreferrer"
		>
			{parsedUrl.alias || parsedUrl.url}
		</a>
	{:else}
		<span class="text-muted-foreground">-</span>
	{/if}
  </span>
</div>