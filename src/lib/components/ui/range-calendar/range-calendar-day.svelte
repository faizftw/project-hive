<script>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();

	export { className as class };
</script>

<RangeCalendarPrimitive.Day
	bind:ref
	class={cn(
		buttonVariants({ variant: "ghost" }),
		"size-8 p-0 font-normal data-selected:opacity-100",
		// Today
		"[&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground",
		// Selection Start
		"data-selection-start:bg-primary data-selection-start:text-primary-foreground data-selection-start:hover:bg-primary data-selection-start:hover:text-primary-foreground data-selection-start:focus:bg-primary data-selection-start:focus:text-primary-foreground",
		// Selection End
		"data-selection-end:bg-primary data-selection-end:text-primary-foreground data-selection-end:hover:bg-primary data-selection-end:hover:text-primary-foreground data-selection-end:focus:bg-primary data-selection-end:focus:text-primary-foreground",
		// Outside months
		"data-outside-month:text-muted-foreground [&[data-outside-month][data-selected]]:bg-accent/50 [&[data-outside-month][data-selected]]:text-muted-foreground data-outside-month:pointer-events-none data-outside-month:opacity-50 [&[data-outside-month][data-selected]]:opacity-30",
		// Disabled
		"data-disabled:text-muted-foreground data-disabled:opacity-50",
		// Unavailable
		"data-unavailable:text-destructive-foreground data-unavailable:line-through",
		className
	)}
	{...restProps}
/>
