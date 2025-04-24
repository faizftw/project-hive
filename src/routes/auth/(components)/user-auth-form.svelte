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
	let name = '';
	let confirmPassword = '';
	let errorMessage = '';
	let showAlert = false;
	let isLoading = false;
	let showPassword = false;
	let showConfirmPassword = false;

	async function onSubmit() {
		showAlert = false;
		errorMessage = '';

		// Validasi input
		if (!email || !password || !name) {
			errorMessage = 'Semua field wajib diisi';
			showAlert = true;
			return;
		}

		// Validasi email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			errorMessage = 'Format email tidak valid';
			showAlert = true;
			return;
		}

		// Validasi password
		if (password.length < 8) {
			errorMessage = 'Password harus memiliki minimal 8 karakter';
			showAlert = true;
			return;
		}

		// Cek password match
		if (password !== confirmPassword) {
			errorMessage = 'Password tidak sesuai';
			showAlert = true;
			return;
		}

		isLoading = true;
		try {
			const response = await fetch('/api/auth/signup', {
				method: 'POST',
				body: JSON.stringify({ email, password, name }),
				headers: { 'Content-Type': 'application/json' }
			});

			const data = await response.json();

			if (response.ok) {
				goto('/auth/login');
			} else {
				errorMessage = data.error || 'An error occurred during signup';
				showAlert = true;
			}
		} catch (error) {
			console.error('Error during signup:', error);
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
					bind:value={email}
					placeholder="name@example.com"
					type="email"
					autocapitalize="none"
					autocomplete="email"
					autocorrect="off"
					disabled={isLoading}
					required
				/>
			</div>
			<div class="grid gap-1">
				<Label for="username">Username</Label>
				<Input
					id="username"
					placeholder="username"
					type="text"
					bind:value={name}
					autocapitalize="none"
					autocomplete="username"
					autocorrect="off"
					disabled={isLoading}
					required
				/>
			</div>
			<div class="grid gap-1 relative">
				<Label for="password">Password</Label>
				<div class="relative">
					<Input
						id="password"
						placeholder="password"
						type={showPassword ? "text" : "password"}
						bind:value={password}
						autocapitalize="none"
						autocomplete="new-password"
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
			<div class="grid gap-1 relative">
				<Label for="confirm-password">Confirm Password</Label>
				<div class="relative">
					<Input
						id="confirm-password"
						placeholder="confirm password"
						bind:value={confirmPassword}
						type={showConfirmPassword ? "text" : "password"}
						autocapitalize="none"
						autocorrect="off"
						disabled={isLoading}
						required
					/>
					<button 
						type="button"
						class="absolute right-3 top-1/2 -translate-y-1/2"
						onclick={() => showConfirmPassword = !showConfirmPassword}
					>
						{#if showConfirmPassword}
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
				Sign Up
			</Button>
		</div>
	</form>
</div>