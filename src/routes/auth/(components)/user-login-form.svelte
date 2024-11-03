<script lang="ts">
	import { Icons } from '$lib/docs/index';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { cn } from '$lib/utils.js';
	import { goto } from '$app/navigation';
	import CrossCircled from 'svelte-radix/CrossCircled.svelte';
	import * as Alert from '$lib/components/ui/alert/index.js';

	let className: string | undefined | null = undefined;
	export { className as class };

	let email = '';
	let password = '';
	let errorMessage = '';
	let showAlert = false;
	let isLoading = false;

	async function onSubmit() {
		showAlert = false;
		errorMessage = '';

		// Validasi input
		if (!email || !password) {
			errorMessage = 'Email and password are required';
			showAlert = true;
			return;
		}

		isLoading = true;
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				body: JSON.stringify({ email, password }),
				headers: { 'Content-Type': 'application/json' }
			});

			const data = await response.json();

			if (response.ok) {
				goto('/');
			} else {
				errorMessage = data.error || 'Invalid email or password';
				showAlert = true;
			}
		} catch (error) {
			console.error('Error during login:', error);
			errorMessage = 'An error occurred. Please try again later.';
			showAlert = true;
		} finally {
			isLoading = false;
		}
	}
</script>

<div class={cn('grid gap-6', className)} {...$$restProps}>
	{#if showAlert}
		<Alert.Root variant="destructive">
			<CrossCircled class="h-4 w-4" />
			<Alert.Title>Error</Alert.Title>
			<Alert.Description>{errorMessage}</Alert.Description>
		</Alert.Root>
	{/if}
	<form on:submit|preventDefault={onSubmit}>
		<div class="grid gap-2">
			<div class="grid gap-1">
				<Label for="email">Email</Label>
				<Input
					id="email"
					placeholder="name@example.com"
					type="email"
					bind:value={email}
					autocapitalize="none"
					autocomplete="email"
					autocorrect="off"
					disabled={isLoading}
					required
				/>
			</div>
			<div class="grid gap-1">
				<Label for="password">Password</Label>
				<Input
					id="password"
					placeholder="password"
					type="password"
					bind:value={password}
					autocapitalize="none"
					autocomplete="current-password"
					autocorrect="off"
					disabled={isLoading}
					required
				/>
			</div>
			<Button type="submit" disabled={isLoading}>
				{#if isLoading}
					<Icons.spinner class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Login
			</Button>
		</div>
	</form>
</div>
