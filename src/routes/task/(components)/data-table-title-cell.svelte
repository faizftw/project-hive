<script lang="ts">
	import type { Label } from '$lib/types';
	import { Badge } from '$lib/components/ui/badge';
	export let value: string;
	export let labelValue: Label | string | null;
	const label = typeof labelValue === 'string'
		? { value: labelValue, label: labelValue }
		: labelValue;
  </script>

  <div class="flex space-x-2">
	{#if label}
	  <Badge key={label.value} variant="outline">{label.label}</Badge>
	{/if}
	<span class="max-w-[500px] truncate font-medium">
	  {value}
	</span>
  </div>