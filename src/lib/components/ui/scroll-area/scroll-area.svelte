<script lang="ts">
    import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";
    import { Scrollbar } from "./index.js";
    import { cn } from "$lib/utils.js";
    
    let {
      ref = $bindable(null),
      class: className,
      orientation = "vertical",
      scrollbarXClasses = "",
      scrollbarYClasses = "",
      children,
      ...restProps
    } = $props();
    
    // Manually exclude 'child' property if it exists (equivalent to WithoutChild)
    const { child, ...propsWithoutChild } = restProps;
  </script>
  
  <ScrollAreaPrimitive.Root
    bind:ref
    data-slot="scroll-area"
    class={cn("relative", className)}
    {...propsWithoutChild}
  >
    <ScrollAreaPrimitive.Viewport
      data-slot="scroll-area-viewport"
      class="ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring-4"
    >
      {@render children?.()}
    </ScrollAreaPrimitive.Viewport>
    {#if orientation === "vertical" || orientation === "both"}
      <Scrollbar orientation="vertical" class={scrollbarYClasses} />
    {/if}
    {#if orientation === "horizontal" || orientation === "both"}
      <Scrollbar orientation="horizontal" class={scrollbarXClasses} />
    {/if}
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>