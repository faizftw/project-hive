<script module>
	import { tv } from "tailwind-variants";
	export const badgeVariants = tv({
		base: "focus:ring-ring inline-flex select-none items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/80 border-transparent shadow",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent shadow",
				outline: "text-foreground",
				success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-transparent shadow px-2 py-1 rounded-full text-xs font-medium items-center gap-1.5',
				warning: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 border-transparent shadow px-2 py-1 rounded-full text-xs font-medium items-center gap-1.5',
				info: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-transparent shadow px-2 py-1 rounded-full text-xs font-medium  items-center gap-1.5',
				error: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-transparent shadow px-2 py-1 rounded-full text-xs font-medium  items-center gap-1.5',
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});
</script>

<script>
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = "default",
		children,
		...restProps
	} = $props();
</script>

<svelte:element
	this={href ? "a" : "span"}
	bind:this={ref}
	{href}
	class={cn(badgeVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
