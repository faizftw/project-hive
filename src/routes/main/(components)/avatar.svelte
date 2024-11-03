<script lang="ts">
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';

	async function handleLogout() {
		try {
			const response = await fetch('/api/auth/logout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				// Invalidate all data
				await invalidateAll();

				// Hard redirect ke login page
				window.location.href = '/auth/login';
			} else {
				console.error('Logout failed');
			}
		} catch (error) {
			console.error('Error during logout:', error);
		}
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Avatar class="h-8 w-8">
			<AvatarFallback>
				{#if $page?.data?.user?.name}
					{$page.data.user.name[0].toUpperCase()}
				{:else}
					U
				{/if}
			</AvatarFallback>
		</Avatar>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Group>
			<DropdownMenu.Label>
				{$page?.data?.user?.name || 'User'}
			</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Item
				on:click={handleLogout}
				class="cursor-pointer text-red-500 focus:text-red-500"
			>
				Log Out
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
