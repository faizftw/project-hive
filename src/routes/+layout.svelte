<script>
	import '../app.css';
	import { ModeWatcher } from "mode-watcher";
  	let { children } = $props();
	import { Toaster } from "$lib/components/ui/sonner";
</script>

<ModeWatcher />
<Toaster />
{@render children?.()}
