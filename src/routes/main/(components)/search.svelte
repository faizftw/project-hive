<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ search: string }>();

	let query = '';

	function handleInput(event: Event) {
		const input = event.target as HTMLInputElement;
		query = input.value;
		dispatch('search', query);
	}
</script>

<div>
	<Input
		type="search"
		placeholder="Search..."
		class="h-9 md:w-[100px] lg:w-[300px]"
		bind:value={query}
		on:input={handleInput}
	/>
</div>
