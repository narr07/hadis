<script setup lang="ts">
const mobileSidebarOpen = ref(false)
const route = useRoute()

watch(
	() => route.fullPath,
	() => {
		mobileSidebarOpen.value = false
	}
)
</script>

<template>
	<div
		class="flex min-h-dvh bg-neutral-50/60 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans"
	>
		<aside
			class="hidden md:flex flex-col sticky top-0 h-dvh w-72 shrink-0 border-r border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 z-20"
		>
			<AppSidebarContent />
		</aside>

		<div
			class="flex flex-col flex-1 min-w-0"
		>
			<HadithSearchHeader
				:mobile-sidebar-open="mobileSidebarOpen"
				@toggle-mobile-sidebar="mobileSidebarOpen = true"
			/>

			<main
				class="flex-1 min-w-0 flex flex-col"
			>
				<slot />
			</main>

			<footer
				class="border-t border-neutral-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500 mt-auto"
			>
				<p>
					Hadis • Ensiklopedia 9 Kitab Hadis © {{ new Date().getFullYear() }}
					<NuxtLink
						to="https://permadi.dev"
						target="_blank"
						rel="noopener noreferrer"
						class="font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary transition-colors underline underline-offset-2"
					>
						narr07
					</NuxtLink>
				</p>
				<p>
					Dibuat dengan
					<NuxtLink
						to="https://nuxt.com"
						target="_blank"
						rel="noopener noreferrer"
						class="font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary transition-colors underline underline-offset-2"
					>
						Nuxt
					</NuxtLink>
					&
					<NuxtLink
						to="https://ui.nuxt.com"
						target="_blank"
						rel="noopener noreferrer"
						class="font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary transition-colors underline underline-offset-2"
					>
						Nuxt UI
					</NuxtLink>
				</p>
			</footer>
		</div>

		<USlideover
			v-model:open="mobileSidebarOpen"
			title="Kitab Hadis"
			side="left"
		>
			<template #body>
				<div
					class="p-3.5 h-full"
				>
					<AppSidebarContent
						mobile
						@navigate="mobileSidebarOpen = false"
					/>
				</div>
			</template>
		</USlideover>
	</div>
</template>
