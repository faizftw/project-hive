<script>
	import '../app.css';
	import { ModeWatcher } from "mode-watcher";
  	let { children } = $props();
	import { Toaster } from "$lib/components/ui/sonner";
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	injectSpeedInsights();
</script>

<ModeWatcher />
<Toaster />
{@render children?.()}
