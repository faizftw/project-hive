<script lang="ts">
	import { priorities } from '../(data)/data.js';
	export let value: string;
	const priority = priorities.find((priority) => priority.value === value);
	const Icon = priority?.icon;
</script>

{#if priority}
	<div class="flex items-center">

		{#if Icon}
			<Icon class={value === 'Low' ? 'text-green-500 mr-2 h-4 w-4' : value === 'Medium' ? 'text-yellow-500 mr-2 h-4 w-4' : 'text-red-500 mr-2 h-4 w-4'}/>
		{/if}
		<span>{priority.label}</span>
	</div>
{/if}
