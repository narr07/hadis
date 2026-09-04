<script setup lang="ts">
import { NARRATORS, findNarrator } from '~~/shared/constants/narrators'
import type { HadithItem, HadithWithNarrator } from '~~/shared/types/hadith'

const { narrator, searchQuery, numberQuery, viewMode, page, updateFilters, resetFilters } = useHadithFilters()
const { bookmarks } = useBookmarks()
const { loadNarratorHadiths } = useHadithData()

const currentNarratorObj = computed(() =>
	findNarrator(narrator.value) || NARRATORS[0]
)

const rawHadiths = ref<HadithItem[]>([])
const isPending = ref(true)
const loadError = ref<Error | null>(null)

async function fetchCurrentData() {
	if (viewMode.value === 'bookmarks') {
		isPending.value = false
		return
	}

	isPending.value = true
	loadError.value = null

	try {
		const targetSlug = currentNarratorObj.value.slug
		const data = await loadNarratorHadiths(targetSlug)
		rawHadiths.value = data
	} catch (err: unknown) {
		loadError.value = err instanceof Error ? err : new Error('Gagal memuat hadits')
	} finally {
		isPending.value = false
	}
}

watch(
	() => narrator.value,
	() => {
		fetchCurrentData()
	},
	{ immediate: true }
)

const status = computed(() => (isPending.value ? 'pending' : loadError.value ? 'error' : 'success'))
const error = computed(() => loadError.value)
const refresh = fetchCurrentData

const filteredHadiths = computed<HadithWithNarrator[]>(() => {
	const currentNarrator = currentNarratorObj.value
	const list = rawHadiths.value

	if (numberQuery.value) {
		const target = Number(numberQuery.value)
		return list
			.filter(h => h.number === target)
			.map(h => ({
				...h,
				narratorSlug: currentNarrator.slug,
				narratorName: currentNarrator.name
			}))
	}

	if (searchQuery.value) {
		const q = searchQuery.value.trim().toLowerCase()
		const numSearch = Number(q.replace(/^#/, ''))
		if (!isNaN(numSearch) && numSearch > 0) {
			return list
				.filter(h => h.number === numSearch || h.id.toLowerCase().includes(q))
				.map(h => ({
					...h,
					narratorSlug: currentNarrator.slug,
					narratorName: currentNarrator.name
				}))
		}

		return list
			.filter(h => h.id.toLowerCase().includes(q))
			.map(h => ({
				...h,
				narratorSlug: currentNarrator.slug,
				narratorName: currentNarrator.name
			}))
	}

	return list.map(h => ({
		...h,
		narratorSlug: currentNarrator.slug,
		narratorName: currentNarrator.name
	}))
})

const filteredBookmarks = computed<HadithWithNarrator[]>(() => {
	let list = bookmarks.value.map(b => ({
		number: b.number,
		arab: b.arab,
		id: b.idText,
		narratorSlug: b.narratorSlug,
		narratorName: b.narratorName
	}))

	if (searchQuery.value) {
		const s = searchQuery.value.toLowerCase()
		list = list.filter(item => item.id.toLowerCase().includes(s))
	}

	if (numberQuery.value) {
		const n = Number(numberQuery.value)
		list = list.filter(item => item.number === n)
	}

	return list
})

const displayedHadiths = computed<HadithWithNarrator[]>(() => {
	const start = (page.value - 1) * 15
	if (viewMode.value === 'bookmarks') {
		return filteredBookmarks.value.slice(start, start + 15)
	}
	return filteredHadiths.value.slice(start, start + 15)
})

const totalItems = computed(() => {
	if (viewMode.value === 'bookmarks') {
		return filteredBookmarks.value.length
	}
	return filteredHadiths.value.length
})

const totalPages = computed(() => {
	if (viewMode.value === 'bookmarks') {
		return Math.ceil(filteredBookmarks.value.length / 15) || 1
	}
	return Math.ceil(filteredHadiths.value.length / 15) || 1
})

const hasNext = computed(() => page.value < totalPages.value)
const hasPrev = computed(() => page.value > 1)

useHead({
	title: computed(() =>
		viewMode.value === 'bookmarks'
			? 'Hadits Tersimpan'
			: currentNarratorObj.value
				? `Hadits ${currentNarratorObj.value.name}`
				: 'Katalog Hadits'
	)
})
</script>

<template>
	<div
		class="px-3 py-3.5 sm:px-6 md:px-8 max-w-6xl w-full mx-auto flex flex-col gap-4 sm:gap-6"
	>
		<div
			class="p-4 sm:p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 shadow-xs"
		>
			<div
				class="flex flex-col gap-1"
			>
				<div
					class="flex items-center gap-2.5 flex-wrap"
				>
					<h1
						class="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white"
					>
						{{
							viewMode === 'bookmarks'
								? 'Hadits Tersimpan'
								: `Hadits Riwayat ${currentNarratorObj?.name || 'Kutubut Tis\'ah'}`
						}}
					</h1>
					<UBadge
						color="primary"
						variant="subtle"
						size="sm"
					>
						{{ totalItems.toLocaleString('id-ID') }} Hadits
					</UBadge>
				</div>

				<p
					class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400"
				>
					{{
						viewMode === 'bookmarks'
							? 'Daftar hadits yang Anda simpan untuk dibaca kembali kapan saja.'
							: `Kitab hadits ${currentNarratorObj?.name} dengan teks Arab berharakat dan terjemahan bahasa Indonesia.`
					}}
				</p>
			</div>

			<!-- Active Filter Badges -->
			<div
				v-if="searchQuery || numberQuery || viewMode === 'bookmarks'"
				class="flex items-center gap-2 flex-wrap"
			>
				<UBadge
					v-if="searchQuery"
					color="neutral"
					variant="outline"
					size="sm"
					class="flex items-center gap-1.5"
				>
					<span>Cari: "{{ searchQuery }}"</span>
					<button
						type="button"
						class="hover:text-red-500 transition-colors"
						@click="updateFilters({ q: '' })"
					>
						<UIcon
							name="i-lucide-x"
							class="size-3"
						/>
					</button>
				</UBadge>

				<UBadge
					v-if="numberQuery"
					color="neutral"
					variant="outline"
					size="sm"
					class="flex items-center gap-1.5"
				>
					<span>No. {{ numberQuery }}</span>
					<button
						type="button"
						class="hover:text-red-500 transition-colors"
						@click="updateFilters({ no: '' })"
					>
						<UIcon
							name="i-lucide-x"
							class="size-3"
						/>
					</button>
				</UBadge>

				<UButton
					variant="subtle"
					color="neutral"
					size="xs"
					icon="i-lucide-rotate-ccw"
					@click="resetFilters"
				>
					Reset Filter
				</UButton>
			</div>
		</div>

		<div
			v-if="status === 'pending'"
			class="flex flex-col gap-4"
		>
			<div
				v-for="i in 4"
				:key="i"
				class="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col gap-4 animate-pulse"
			>
				<div
					class="flex justify-between"
				>
					<div
						class="h-5 w-28 bg-neutral-200 dark:bg-neutral-800 rounded-md"
					/>
					<div
						class="h-5 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-md"
					/>
				</div>
				<div
					class="h-16 bg-neutral-200 dark:bg-neutral-800 rounded-md"
				/>
				<div
					class="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-md"
				/>
			</div>
		</div>

		<div
			v-else-if="error"
			class="p-10 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-red-200/80 dark:border-red-900/50 flex flex-col items-center justify-center gap-3"
		>
			<div
				class="size-14 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center"
			>
				<UIcon
					name="i-lucide-alert-circle"
					class="size-7"
				/>
			</div>
			<h3
				class="text-base font-semibold text-neutral-900 dark:text-white"
			>
				Gagal Memuat Hadits
			</h3>
			<p
				class="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm leading-relaxed"
			>
				Terjadi kendala saat mengambil data hadits dari server. Silakan coba kembali beberapa saat lagi.
			</p>
			<UButton
				variant="solid"
				color="primary"
				size="sm"
				icon="i-lucide-rotate-ccw"
				class="mt-2"
				@click="() => refresh()"
			>
				Coba Lagi
			</UButton>
		</div>

		<div
			v-else-if="displayedHadiths.length > 0"
			class="flex flex-col gap-4"
		>
			<HadithCard
				v-for="item in displayedHadiths"
				:key="`${item.narratorSlug}-${item.number}`"
				:hadith="item"
			/>
		</div>

		<div
			v-else
			class="p-12 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center gap-3"
		>
			<div
				class="size-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400"
			>
				<UIcon
					name="i-lucide-book-open"
					class="size-7"
				/>
			</div>
			<h3
				class="text-base font-semibold text-neutral-900 dark:text-neutral-100"
			>
				{{
					viewMode === 'bookmarks'
						? 'Belum ada hadits tersimpan'
						: 'Hadits tidak ditemukan'
				}}
			</h3>
			<p
				class="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm"
			>
				{{
					viewMode === 'bookmarks'
						? 'Klik ikon bookmark pada kartu hadits untuk menyimpannya ke daftar bacaan Anda.'
						: 'Coba periksa kembali kata kunci pencarian atau nomor hadits yang Anda masukkan.'
				}}
			</p>
			<UButton
				variant="subtle"
				color="primary"
				size="sm"
				icon="i-lucide-rotate-ccw"
				class="mt-2"
				@click="resetFilters"
			>
				Kembali ke Semua Hadits
			</UButton>
		</div>

		<HadithPagination
			v-if="displayedHadiths.length > 0 && totalPages > 1"
			:page="page"
			:total-pages="totalPages"
			:total="totalItems"
			:has-next="hasNext"
			:has-prev="hasPrev"
			:pending="status === 'pending'"
			@change-page="(p) => updateFilters({ page: p })"
		/>
	</div>
</template>
