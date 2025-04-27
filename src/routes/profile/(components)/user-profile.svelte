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
  import { toast } from 'svelte-sonner';

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
  
  // Project data
  const projectsCount = $derived($page.data.projectsCount || 0);
  const completedProjectsCount = $derived($page.data.completedProjectsCount || 0);
  
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

    const result = await response.json();
    
    if (!response.ok) {
      // Tampilkan error spesifik dari server
      throw new Error(result.error || 'Gagal memperbarui profil');
    }
    
    // Update local data
    Object.assign(userData, result.user);
    isEditDialogOpen = false;
    
    // Tampilkan notifikasi sukses
    toast.success(result.message || 'Profil berhasil diperbarui');
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.error(error.message || 'Gagal memperbarui profil. Silahkan coba lagi.');
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
        </div>
      </div>

      <Button onclick={() => isEditDialogOpen = true}>Edit Profil</Button>
    </div>
  </Card>

  <MetricCards 
    tasksCount={tasksCount} 
    completedTasksCount={completedTasksCount}
    projectsCount={projectsCount} 
    completedProjectsCount={completedProjectsCount}
  />

  <Tabs value="activity" class="w-full">
    <TabsList class="grid w-full grid-cols-2 mb-6">
      <TabsTrigger value="activity">Aktivitas Terkini</TabsTrigger>
      <TabsTrigger value="details">Detail Akun</TabsTrigger>
    </TabsList>
    <TabsContent value="activity">
      <ActivityList activities={recentActivities} />
    </TabsContent>
    <TabsContent value="details">
      <Card class="p-6">
        <h2 class="text-xl font-semibold mb-4">Detail Akun</h2>
        <div class="space-y-4">
          <div>
            <h3 class="text-sm font-medium text-muted-foreground">Username</h3>
            <p class="text-base">{userData.name}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-muted-foreground">Email</h3>
            <p class="text-base">{userData.email}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-muted-foreground">Tanggal Bergabung</h3>
            <p class="text-base">{userData.joinDate}</p>
          </div>
        </div>
      </Card>
    </TabsContent>
  </Tabs>

  <EditProfileDialog
  bind:open={isEditDialogOpen}
  on:update:open={(e) => isEditDialogOpen = e.detail}
  user={userData}
  onUpdate={handleProfileUpdate}
/>
</div> 