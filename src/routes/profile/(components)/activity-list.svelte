<script>
  import { Card } from "$lib/components/ui/card/index.js";
  import { Clock, FileEdit, FolderKanban } from "lucide-svelte";
  import { page } from '$app/stores';

  const { activities = [] } = $props();

  // Function to format timestamp
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    // If today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If earlier
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // Get icon based on activity type
  function getIcon(activity) {
    if (activity.type === 'task') {
      return FileEdit;
    } else if (activity.type === 'project') {
      return FolderKanban;
    }
    return FileEdit; // Default icon
  }

  // Create description based on activity type
  function getDescription(activity) {
    if (activity.type === 'task') {
      return `Created new task "${activity.title}"`;
    } else if (activity.type === 'project') {
      return `Created new project "${activity.title}"`;
    }
    return activity.title;
  }
  const Component = $derived(getIcon(activities));
</script>

<Card class="p-6">
  <h2 class="text-xl font-semibold mb-4">Recent Activity</h2>
  <div class="space-y-4">
    {#if !activities || activities.length === 0}
      <p class="text-muted-foreground">No recent activity</p>
    {:else}
      {#each activities as activity}
        <div class="flex items-start gap-4">
          <div class="mt-0.5 bg-muted rounded-full p-2">
            <Component class="h-4 w-4 text-muted-foreground" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium">{getDescription(activity)}</p>
            <div class="flex items-center text-xs text-muted-foreground mt-1">
              <Clock class="mr-1 h-3 w-3" />
              <span>{formatTimestamp(activity.timestamp)}</span>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</Card> 