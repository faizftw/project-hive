<script>
	import { Toaster as Sonner } from "svelte-sonner";
	import { mode } from "mode-watcher";
</script>

<Sonner
	theme={$mode}
	class="toaster group"
	richColors
	style="z-index: 9999;"
	toastOptions={{
		classes: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg z-9999",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
		},
		duration: 5000,
	}}
	{...$$restProps}
/>
