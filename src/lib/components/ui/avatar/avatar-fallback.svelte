<script>
	import { Avatar as AvatarPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	let className = undefined;
	export { className as class };
</script>

<AvatarPrimitive.Fallback
	class={cn('bg-muted flex h-full w-full items-center justify-center rounded-full', className)}
	{...$$restProps}
>
	<slot />
</AvatarPrimitive.Fallback>
