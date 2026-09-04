<script setup lang="ts">
defineProps<{
	mobileSidebarOpen: boolean
}>()

const emit = defineEmits<{
	toggleMobileSidebar: []
}>()

const { searchQuery, numberQuery, updateFilters } = useHadithFilters()

const localSearch = ref(searchQuery.value)
const localNumber = ref(numberQuery.value)

let searchTimer: ReturnType<typeof setTimeout> | undefined
let numberTimer: ReturnType<typeof setTimeout> | undefined

watch(
	searchQuery,
	(val) => {
		localSearch.value = val
	}
)

watch(
	numberQuery,
	(val) => {
		localNumber.value = val
	}
)

function onSearchInput(val: string) {
	clearTimeout(searchTimer)
	searchTimer = setTimeout(() => {
		updateFilters({ q: val.trim() }, { replace: true })
	}, 280)
}

function onNumberInput(val: string) {
	clearTimeout(numberTimer)
	numberTimer = setTimeout(() => {
		updateFilters({ no: val.trim() }, { replace: true })
	}, 250)
}

function handleSearch() {
	clearTimeout(searchTimer)
	updateFilters({ q: localSearch.value.trim() }, { replace: true })
}

function handleNumber() {
	clearTimeout(numberTimer)
	updateFilters({ no: localNumber.value.trim() }, { replace: true })
}

function clearSearch() {
	clearTimeout(searchTimer)
	localSearch.value = ''
	updateFilters({ q: '' }, { replace: true })
}

function clearNumber() {
	clearTimeout(numberTimer)
	localNumber.value = ''
	updateFilters({ no: '' }, { replace: true })
}

onBeforeUnmount(() => {
	clearTimeout(searchTimer)
	clearTimeout(numberTimer)
})
</script>

<template>
	<header
		class="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-4 py-3 sm:px-6"
	>
		<div
			class="flex items-center gap-2"
		>
			<UButton
				class="md:hidden"
				icon="i-lucide-menu"
				variant="ghost"
				color="neutral"
				size="sm"
				aria-label="Buka Menu & Kitab Hadis"
				@click="emit('toggleMobileSidebar')"
			/>

			<NuxtLink
				to="/"
				class="md:hidden flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white"
			>
				<img
					src="/favicon.svg"
					alt="Logo Hadis"
					class="size-7 rounded-lg object-contain shadow-xs"
				>
				<span>Hadis</span>
			</NuxtLink>
		</div>

		<div
			class="flex items-center gap-2 flex-1 max-w-xl"
		>
			<form
				class="flex-1 relative"
				@submit.prevent="handleSearch"
			>
				<UInput
					v-model="localSearch"
					icon="i-lucide-search"
					placeholder="Cari hadits (contoh: niat, shalat, sedekah)..."
					size="sm"
					class="w-full"
					@update:model-value="onSearchInput"
					@keydown.enter="handleSearch"
				>
					<template
						v-if="localSearch"
						#trailing
					>
						<button
							type="button"
							class="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 p-1"
							aria-label="Hapus pencarian"
							@click="clearSearch"
						>
							<UIcon
								name="i-lucide-x"
								class="size-3.5"
							/>
						</button>
					</template>
				</UInput>
			</form>

			<form
				class="w-28 hidden sm:block relative"
				@submit.prevent="handleNumber"
			>
				<UInput
					v-model="localNumber"
					icon="i-lucide-hash"
					placeholder="No. hadits"
					type="number"
					size="sm"
					class="w-full"
					@update:model-value="onNumberInput"
					@keydown.enter="handleNumber"
				>
					<template
						v-if="localNumber"
						#trailing
					>
						<button
							type="button"
							class="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 p-1"
							aria-label="Hapus nomor hadits"
							@click="clearNumber"
						>
							<UIcon
								name="i-lucide-x"
								class="size-3.5"
							/>
						</button>
					</template>
				</UInput>
			</form>
		</div>

		<!-- Right: Quick actions -->
		<div
			class="flex items-center gap-1.5"
		>
			<UColorModeButton
				class="md:hidden"
			/>
		</div>
	</header>
</template>
