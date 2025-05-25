<script lang="ts">
	export let description: string | null;
	import * as HoverCard from "$lib/components/ui/hover-card/index.js";
</script>

<div class="flex space-x-2">
	
	<span class="max-w-[500px] truncate font-medium">
		<HoverCard.Root>
			<HoverCard.Trigger>{description}</HoverCard.Trigger>
			<HoverCard.Content>
				{description}
			</HoverCard.Content>
		  </HoverCard.Root>
		{description}
	</span>
</div>
