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
					url('/images/v882-kul-40-a.jpg?auto=format&fit=crop&w=1376&q=80');"
		></div>
		<div class="absolute inset-0 bg-black/50"></div>
		<div class="relative z-20 flex items-center text-lg font-medium">
			<!-- <Command class="mr-2 h-6 w-6" /> -->
			Project Hive
		</div>
		<div class="relative z-20 mt-auto">
			<blockquote class="space-y-2">
				<p class="text-lg">
					Project Hive adalah platform manajemen proyek yang kuat yang berfokus membantu individu
					merencanakan, melacak, dan menyelesaikan proyek dengan mudah. Dengan fitur pengorganisasian
					tugas yang intuitif, alur kerja yang dapat disesuaikan, dan pelacakan kemajuan secara real-time,
					Project Hive menawarkan pendekatan yang terstruktur untuk manajemen proyek, menjaga pengguna
					agar selalu tepat waktu dan fokus pada prioritas untuk mencapai tujuan secara efisien.
				</p>
			</blockquote>
		</div>
	</div>
	<div class="lg:p-8">
		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div class="flex flex-col space-y-2 text-center">
				<h1 class="text-2xl font-semibold tracking-tight">Sign Up</h1>
				<p class="text-muted-foreground text-sm">
					Masukkan email, username, dan password Anda untuk mendaftar
				</p>
			</div>
			<UserAuthForm />
		</div>
	</div>
</div>
