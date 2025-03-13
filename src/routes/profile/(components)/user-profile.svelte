<script>
  import { Card } from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Avatar, AvatarFallback, AvatarImage } from "$lib/components/ui/avatar/index.js";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs/index.js";
  import EditProfileDialog from "./edit-profile-dialog.svelte";
  import ActivityList from "./activity-list.svelte";
  import MetricCards from "./metric-cards.svelte";
  import { CalendarDays, Mail, User } from "lucide-svelte";
  import { page } from '$app/stores';

  // Get data from page store using runes
  const userData = $state(($page.data.user || {
    id: "",
    name: "",
    email: "",
    joinDate: ""
  }));

  // Task data
  const tasksCount = $derived($page.data.tasksCount || 0);
  const completedTasksCount = $derived($page.data.completedTasksCount || 0);
  const inProgressTasksCount = $derived($page.data.inProgressTasksCount || 0);
  const todoTasksCount = $derived($page.data.todoTasksCount || 0);
  const backlogTasksCount = $derived($page.data.backlogTasksCount || 0);
  const canceledTasksCount = $derived($page.data.canceledTasksCount || 0);
  const pendingTasksCount = $derived($page.data.pendingTasksCount || 0);
  
  // Project data
  const projectsCount = $derived($page.data.projectsCount || 0);
  const activeProjectsCount = $derived($page.data.activeProjectsCount || 0);
  const completedProjectsCount = $derived($page.data.completedProjectsCount || 0);
  const cancelledProjectsCount = $derived($page.data.cancelledProjectsCount || 0);
  const onHoldProjectsCount = $derived($page.data.onHoldProjectsCount || 0);
  
  // Activities data
  const recentActivities = $derived($page.data.recentActivities || []);

  let isEditDialogOpen = $state(false);

  async function handleProfileUpdate(updatedData) {
    try {
      // Call API to update profile
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      
      // Update local data
      Object.assign(userData, result.user);
      isEditDialogOpen = false;
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  }

  function setIsEditDialogOpen(value) {
    isEditDialogOpen = value;
  }

  // Function to get name initials for avatar
  function getInitials(name) {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
</script>

<div class="space-y-8">
  <Card class="p-6">
    <div class="flex flex-col md:flex-row gap-6 items-start md:items-center">
      <Avatar class="h-24 w-24">
        <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
      </Avatar>

      <div class="flex-1 space-y-2">
        <h1 class="text-2xl font-bold">{userData.name}</h1>
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-4 text-muted-foreground">
          <div class="flex items-center gap-1">
            <Mail class="h-4 w-4" />
            <span>{userData.email}</span>
          </div>
          <div class="flex items-center gap-1">
            <CalendarDays class="h-4 w-4" />
            <span>Joined {userData.joinDate}</span>
          </div>
        </div>
      </div>

      <Button onclick={() => isEditDialogOpen = true}>Edit Profile</Button>
    </div>
  </Card>

  <MetricCards 
    tasksCount={tasksCount} 
    completedTasksCount={completedTasksCount}
    inProgressTasksCount={inProgressTasksCount}
    todoTasksCount={todoTasksCount}
    backlogTasksCount={backlogTasksCount}
    canceledTasksCount={canceledTasksCount}
    pendingTasksCount={pendingTasksCount}
    projectsCount={projectsCount} 
    activeProjectsCount={activeProjectsCount}
    completedProjectsCount={completedProjectsCount}
    cancelledProjectsCount={cancelledProjectsCount}
    onHoldProjectsCount={onHoldProjectsCount}
  />

  <Tabs value="activity" class="w-full">
    <TabsList class="grid w-full grid-cols-2 mb-6">
      <TabsTrigger value="activity">Recent Activity</TabsTrigger>
      <TabsTrigger value="details">Account Details</TabsTrigger>
    </TabsList>
    <TabsContent value="activity">
      <ActivityList activities={recentActivities} />
    </TabsContent>
    <TabsContent value="details">
      <Card class="p-6">
        <div class="space-y-4">
          <div>
            <h3 class="text-sm font-medium text-muted-foreground">Full Name</h3>
            <p class="text-base">{userData.name}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-muted-foreground">Email</h3>
            <p class="text-base">{userData.email}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-muted-foreground">Joined Date</h3>
            <p class="text-base">{userData.joinDate}</p>
          </div>
        </div>
      </Card>
    </TabsContent>
  </Tabs>

  <EditProfileDialog
    bind:open={isEditDialogOpen}
    onOpenChange={setIsEditDialogOpen}
    user={userData}
    onUpdate={handleProfileUpdate}
  />
</div> 