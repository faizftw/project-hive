<script lang="ts">
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import {Home } from "lucide-svelte"
</script>

<Breadcrumb.Root>
    <Breadcrumb.List>
  <Breadcrumb.Item>
    <Breadcrumb.Link href="/" class="flex items-center">
        <Home class="h-4 w-4 mr-1" />
        <span>Home</span>
    </Breadcrumb.Link>
  </Breadcrumb.Item>
  <Breadcrumb.Separator  class="flex items-center" />
  <Breadcrumb.Item>
    <Breadcrumb.Page  class="flex items-center">Profile</Breadcrumb.Page>
  </Breadcrumb.Item>
</Breadcrumb.List>
</Breadcrumb.Root>