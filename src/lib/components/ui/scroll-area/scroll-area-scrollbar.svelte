<script lang="ts">
    import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";
    import { cn } from "$lib/utils.js";
    
    let {
      ref = $bindable(null),
      class: className,
      orientation = "vertical",
      children,
      ...restProps
    }: {
      ref?: HTMLElement | null;
      class?: string;
      orientation?: "vertical" | "horizontal";
      children?: any;
      [key: string]: any;
    } = $props();
    
    // Manually exclude 'child' property if it exists (equivalent to WithoutChild)
    const { child, ...propsWithoutChild } = restProps;
  </script>
  
  <ScrollAreaPrimitive.Scrollbar
    bind:ref
    data-slot="scroll-area-scrollbar"
    orientation={orientation}
    class={cn(
      "flex touch-none select-none p-px transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent",
      className
    )}
    {...propsWithoutChild}
  >
    {@render children?.()}
    <ScrollAreaPrimitive.Thumb
      data-slot="scroll-area-thumb"
      class="bg-border relative flex-1 rounded-full"
    />
  </ScrollAreaPrimitive.Scrollbar>