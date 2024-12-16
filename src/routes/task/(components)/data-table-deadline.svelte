<script lang="ts">
	import { formatDate } from "date-fns";

	export let deadline: string | null; 
    const date = new Date(deadline || '');
    const formattedDate = formatDate(date, 'MM/dd/yyyy hh:mm a');
</script>

<div class="flex space-x-2">
	
	<span class="max-w-[500px]">
		{formattedDate}
	</span>
</div>

