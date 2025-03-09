<script lang="ts">
	// Halaman ini hanya sebagai fallback, redirect akan ditangani oleh server
	import { Skeleton } from "$lib/components/ui/skeleton";
	import { ArrowRight } from "lucide-svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Code, Hexagon, Workflow, ListOrdered } from "lucide-svelte";
	import Darkmode from "./main/(components)/darkmode.svelte";
</script>


<div class="min-h-screen flex flex-col items-center justify-center  px-4 sm:px-6">
	<div class="pointer-events-none fixed inset-0 z-[-999]">
        <div class="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" ></div>
        <div class="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" ></div>
        <div class="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" ></div>
      </div>
	<div class="flex justify-end w-full mt-4">
		<Darkmode />
	</div>
	<main class="max-w-3xl mx-auto text-center space-y-8 mt-10">
		<div class="flex justify-center mb-6">
			<Hexagon class="h-16 w-16 text-primary" strokeWidth={1.5} />
		</div>
		

		<h1 class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
			Project Hive
		</h1>

		<p class="text-xl text-muted-foreground max-w-2xl mx-auto">
			Your complete project management solution. Simple, powerful, and effective.
		</p>

		<div class="grid md:grid-cols-3 gap-8 py-8">
			<div class="flex flex-col items-center p-4">
				<Code class="h-10 w-10 text-primary mb-4" />
				<h3 class="text-lg font-semibold mb-2">Task Management</h3>
				<p class="text-muted-foreground text-sm">Manage all your tasks in one organized workspace</p>
			</div>
			<div class="flex flex-col items-center p-4">
				<Workflow class="h-10 w-10 text-primary mb-4" />
				<h3 class="text-lg font-semibold mb-2">Project Tracking</h3>
				<p class="text-muted-foreground text-sm">Track progress and keep projects on schedule</p>
			</div>
			<div class="flex flex-col items-center p-4">
				<ListOrdered class="h-10 w-10 text-primary mb-4" />
				<h3 class="text-lg font-semibold mb-2">Priority Planning</h3>
				<p class="text-muted-foreground text-sm">Focus on what matters most with clear priorities</p>
			</div>
		</div>

		<div class="pt-4">
			<a href="/auth/login">
				<Button size="lg" class="group px-6 py-6 text-lg transition-all duration-300 hover:translate-y-[-2px]">
					Get Started
					<ArrowRight class="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
				</Button>
			</a>
		</div>
	</main>

	<footer class="mt-auto py-6 text-sm text-slate-500">
		© {new Date().getFullYear()} Project Hive. All rights reserved.
	</footer>
</div>
