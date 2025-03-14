<script>
  import UserProfile from "./(components)/user-profile.svelte";
  import BreadCrumb from "./(components)/breadcrumb.svelte"
</script>

<main class="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">
    <div class="mb-3">
      <BreadCrumb/>
    </div>
    
    <UserProfile />
  </div>
</main> 