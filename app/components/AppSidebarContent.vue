<script setup lang="ts">
import type { Narrator } from '~~/server/utils/hadiths'

defineProps<{
	mobile?: boolean
}>()

const emit = defineEmits<{
	navigate: []
}>()

const { narrator, viewMode, updateFilters, resetFilters, searchQuery, numberQuery } = useHadithFilters()
const { bookmarks } = useBookmarks()

const { data: narratorsData } = await useFetch<{ narrators: Narrator[] }>(
	'/api/narrators'
)
const narrators = computed(() => narratorsData.value?.narrators ?? [])

const hasActiveFilters = computed(() =>
	narrator.value !== 'bukhari' || Boolean(searchQuery.value) || Boolean(numberQuery.value) || viewMode.value !== 'all'
)

function selectNarrator(slug: string) {
	updateFilters({ perawi: slug, mode: 'all' })
	emit('navigate')
}

function setMode(mode: 'all' | 'bookmarks') {
	updateFilters({ mode })
	emit('navigate')
}

function handleReset() {
	resetFilters()
	emit('navigate')
}
</script>

<template>
	<div
		class="flex flex-col h-full justify-between"
	>
		<div
			class="flex flex-col gap-3 sm:gap-4 min-h-0 flex-1"
		>
			<NuxtLink
				v-if="!mobile"
				to="/"
				class="flex items-center gap-3 group focus-visible:outline-3 outline-primary/25 rounded-xl p-1"
				@click="emit('navigate')"
			>
				<img
					src="/favicon.svg"
					alt="Logo Hadis"
					class="size-8 rounded-xl object-contain shadow-md shadow-primary/20 group-hover:scale-105 transition-transform"
				>
				<div
					class="flex flex-col"
				>
					<span
						class="font-bold text-base tracking-tight group-hover:text-primary transition-colors text-neutral-900 dark:text-white"
					>
						Hadis
					</span>
					<span
						class="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium"
					>
						Kutubut Tis'ah
					</span>
				</div>
			</NuxtLink>

			<div
				class="grid grid-cols-2 gap-1 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl"
			>
				<button
					type="button"
					class="flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all min-h-[38px]"
					:class="
						viewMode !== 'bookmarks'
							? 'bg-white dark:bg-neutral-900 text-primary shadow-sm'
							: 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
					"
					@click="setMode('all')"
				>
					<UIcon
						name="i-lucide-book-open"
						class="size-3.5"
					/>
					Semua
				</button>

				<button
					type="button"
					class="flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all min-h-[38px]"
					:class="
						viewMode === 'bookmarks'
							? 'bg-white dark:bg-neutral-900 text-primary shadow-sm'
							: 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
					"
					@click="setMode('bookmarks')"
				>
					<UIcon
						name="i-lucide-bookmark"
						class="size-3.5"
					/>
					Tersimpan
					<UBadge
						v-if="bookmarks.length > 0"
						color="primary"
						variant="solid"
						size="xs"
						class="rounded-full px-1.5 py-0"
					>
						{{ bookmarks.length }}
					</UBadge>
				</button>
			</div>

			<div
				class="flex flex-col gap-2 min-h-0 flex-1"
			>
				<div
					class="flex items-center justify-between px-1"
				>
					<span
						class="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
					>
						Kitab Perawi (9 Imam)
					</span>

					<button
						v-if="hasActiveFilters"
						type="button"
						class="text-xs text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors flex items-center gap-1 py-1"
						@click="handleReset"
					>
						<UIcon
							name="i-lucide-rotate-ccw"
							class="size-3"
						/>
						Reset
					</button>
				</div>

				<nav
					class="flex flex-col gap-1 overflow-y-auto pr-1 flex-1 [scrollbar-gutter:stable]"
				>
					<button
						v-for="narr in narrators"
						:key="narr.slug"
						type="button"
						class="flex items-center justify-between px-3 py-2.5 sm:py-2 min-h-[42px] text-sm rounded-xl transition-all text-left group"
						:class="
							narrator === narr.slug && viewMode !== 'bookmarks'
								? 'bg-primary/10 text-primary font-bold dark:bg-primary/20 shadow-xs'
								: 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
						"
						@click="selectNarrator(narr.slug)"
					>
						<span
							class="truncate flex items-center gap-2"
						>
							<UIcon
								name="i-lucide-book"
								class="size-3.5 transition-colors"
								:class="
									narrator === narr.slug && viewMode !== 'bookmarks'
										? 'text-primary'
										: 'text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200'
								"
							/>
							{{ narr.name }}
						</span>

						<span
							class="text-xs px-2 py-0.5 rounded-full font-mono font-normal"
							:class="
								narrator === narr.slug && viewMode !== 'bookmarks'
									? 'bg-primary/20 text-primary dark:bg-primary/30'
									: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
							"
						>
							{{ narr.total.toLocaleString('id-ID') }}
						</span>
					</button>
				</nav>
			</div>
		</div>

		<div
			class="pt-3 mt-2 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400"
		>
			<div
				class="flex items-center gap-2"
			>
				<UColorModeButton />
			</div>

			<UButton
				to="https://github.com/narr07"
				target="_blank"
				icon="i-simple-icons-github"
				aria-label="GitHub @narr07"
				color="neutral"
				variant="ghost"
				size="sm"
			/>
		</div>
	</div>
</template>
