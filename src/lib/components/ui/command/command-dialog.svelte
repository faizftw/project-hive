<script>
	import { Command as CommandPrimitive, Dialog as DialogPrimitive } from "bits-ui";
	import Command from "./command.svelte";
	import * as Dialog from "$lib/components/ui/dialog/index.js";

	let {
		open = $bindable(false),
		ref = $bindable(null),
		value = $bindable(""),
		portalProps,
		children,
		...restProps
	} = $props();
</script>

<Dialog.Root bind:open {...restProps}>
	<Dialog.Content class="overflow-hidden p-0" {portalProps}>
		<Command
			class="**:data-cmdk-group-heading:px-2 **:data-cmdk-group-heading:font-medium [&_[data-cmdk-group]:not([hidden])_~[data-cmdk-group]]:pt-0 **:data-cmdk-group:px-2 [&_[data-cmdk-input-wrapper]_svg]:h-5 [&_[data-cmdk-input-wrapper]_svg]:w-5 **:data-cmdk-input:h-12 **:data-cmdk-item:px-2 **:data-cmdk-item:py-3 [&_[data-cmdk-item]_svg]:h-5 [&_[data-cmdk-item]_svg]:w-5"
			{...restProps}
			bind:value
			bind:ref
			{children}
		/>
	</Dialog.Content>
</Dialog.Root>
