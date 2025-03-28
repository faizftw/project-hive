<script lang="ts">
	import UserAuthForm from '../(components)/user-auth-form.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Sun } from 'svelte-radix';
	import { Moon } from 'svelte-radix';
	import { toggleMode } from 'mode-watcher';
	import { goto } from '$app/navigation';

	function handleLogin() {
		goto('/auth/login'); // Navigate to the '/auth/login' route
	}
</script>

<div
	class="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 sm:grid max-sm:grid"
>
	<Button variant="ghost" class="absolute right-4 top-4 md:right-8 md:top-8" onclick={handleLogin}>
		Login
	</Button>
	<Button
		onclick={toggleMode}
		variant="outline"
		size="icon"
		class="absolute right-28 top-4 max-md:left-4 md:top-8"
	>
		<Sun
			class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
		/>
		<Moon
			class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
		/>
		<span class="sr-only">Toggle theme</span>
	</Button>
	<div class="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
		<div
			class="absolute inset-0 bg-cover"
			style="
				background-image:
					url('/lib/docs/bg/v882-kul-40-a.jpg?auto=format&fit=crop&w=1376&q=80');"
		></div>
		<div class="relative z-20 flex items-center text-lg font-medium">
			<!-- <Command class="mr-2 h-6 w-6" /> -->
			Project Hive
		</div>
		<div class="relative z-20 mt-auto">
			<blockquote class="space-y-2">
				<p class="text-lg">
					Project Hive is a powerful project management platform focused on helping individuals
					plan, track, and complete projects with ease. Featuring intuitive task organization,
					customizable workflows, and real-time progress tracking, Project Hive provides a
					streamlined approach to project management, keeping users on top of deadlines and
					priorities to achieve their goals efficiently.
				</p>
			</blockquote>
		</div>
	</div>
	<div class="lg:p-8">
		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div class="flex flex-col space-y-2 text-center">
				<h1 class="text-2xl font-semibold tracking-tight">Create an account</h1>
				<p class="text-muted-foreground text-sm">
					Enter your email and password below to create your account
				</p>
			</div>
			<UserAuthForm />
		</div>
	</div>
</div>
