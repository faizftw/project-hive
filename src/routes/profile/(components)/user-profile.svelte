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

  // Ambil data dari store page
  $: userData = $page.data.user || {
    id: "",
    name: "",
    email: "",
    joinDate: ""
  };

  $: tasksCount = $page.data.tasksCount || 0;
  $: projectsCount = $page.data.projectsCount || 0;
  $: recentActivities = $page.data.recentActivities || [];

  let isEditDialogOpen = false;

  async function handleProfileUpdate(updatedData) {
    try {
      // Panggil API untuk update profil
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
      
      // Update data lokal
      userData = { ...userData, ...result.user };
      isEditDialogOpen = false;
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Gagal memperbarui profil. Silakan coba lagi.');
    }
  }

  function setIsEditDialogOpen(value) {
    isEditDialogOpen = value;
  }

  // Fungsi untuk mendapatkan inisial nama untuk avatar
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
            <span> Joined {userData.joinDate}</span>
          </div>
        </div>
      </div>

      <Button onclick={() => isEditDialogOpen = true}>Edit Profile</Button>
    </div>
  </Card>

  <MetricCards tasksCount={tasksCount} projectsCount={projectsCount} />

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
            <h3 class="text-sm font-medium text-muted-foreground">Username</h3>
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