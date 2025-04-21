<script lang="ts">
	export let url: string | { url: string; alias: string | null } | null;
	
	// Parse URL jika dalam bentuk string
	let parsedUrl: { url: string; alias: string | null } | null = null;
	
	if (url) {
		if (typeof url === 'string') {
			try {
				parsedUrl = JSON.parse(url);
			} catch (e) {
				console.error('Error parsing URL:', e);
				parsedUrl = { url: url, alias: null };
			}
		} else {
			parsedUrl = url;
		}
	}
</script>

<div class="flex space-x-2">
  <span class="max-w-[250px] truncate font-medium">
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