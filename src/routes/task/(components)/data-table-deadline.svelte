<script lang="ts">
	import { format } from "date-fns";
	import { id } from "date-fns/locale/id";
	
	export let deadline: string | null; 
	const date = new Date(deadline || '');
	const formattedDate = format(date, 'dd MMM yyyy hh:mm a', { locale: id });
</script>

<div class="flex space-x-2">
	<span class="max-w-[500px]">
		{formattedDate}
	</span>
</div>