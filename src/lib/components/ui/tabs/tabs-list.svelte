<script>
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	let className = undefined;
	export { className as class };
</script>

<TabsPrimitive.List
	class={cn(
		'bg-muted text-muted-foreground inline-flex h-9 items-center justify-center rounded-lg p-1',
		className
	)}
	{...$$restProps}
>
	<slot />
</TabsPrimitive.List>
