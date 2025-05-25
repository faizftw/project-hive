<script>
	import '../app.css';
	import { ModeWatcher } from "mode-watcher";
  	let { children } = $props();
	import { Toaster } from "$lib/components/ui/sonner/index.js";
</script>

<ModeWatcher />
<Toaster />
{@render children?.()}
