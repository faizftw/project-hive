<script lang="ts">
	import { Icons } from '$lib/docs/index';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { cn } from '$lib/utils.js';
	import { goto } from '$app/navigation';
	import { CrossCircled, EyeOpen, EyeNone } from 'svelte-radix';
	import * as Alert from '$lib/components/ui/alert/index.js';

	let className: string | undefined | null = undefined;
	export { className as class };

	let email = '';
	let password = '';
	let errorMessage = '';
	let showAlert = false;
	let isLoading = false;
	let showPassword = false;

	async function onSubmit() {
		showAlert = false;
		errorMessage = '';

		// Validasi input
		if (!email || !password) {
			errorMessage = 'Email dan password wajib diisi';
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
				errorMessage = data.error || 'Email atau password salah';
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
	<form onsubmit={onSubmit}>
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
				<div class="relative">
					<Input
						id="password"
						placeholder="password"
						type={showPassword ? "text" : "password"}
						bind:value={password}
						autocapitalize="none"
						autocomplete="current-password"
						autocorrect="off"
						disabled={isLoading}
						required
					/>
					<button 
						type="button"
						class="absolute right-3 top-1/2 -translate-y-1/2"
						onclick={() => showPassword = !showPassword}
					>
						{#if showPassword}
							<EyeNone class="h-4 w-4 text-muted-foreground" />
						{:else}
							<EyeOpen class="h-4 w-4 text-muted-foreground" />
						{/if}
					</button>
				</div>
			</div>
			<Button type="submit" disabled={isLoading} class=''>
				{#if isLoading}
					<Icons.spinner class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Login
			</Button>
		</div>
	</form>
</div>
