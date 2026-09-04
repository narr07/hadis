<script setup lang="ts">
import type { Narrator } from '~~/shared/types/hadith'

interface HadithDetailResponse {
	number: number
	arab: string
	id: string
	narrator: Narrator
	prevNumber: number | null
	nextNumber: number | null
}

const route = useRoute()
const toast = useToast()
const { isBookmarked, toggleBookmark } = useBookmarks()

const narratorSlug = computed(() => route.params.narrator as string)
const hadithNumber = computed(() => Number(route.params.number))

const { data: hadith, error, status } = await useFetch<HadithDetailResponse>(
	() => `/api/hadiths/${narratorSlug.value}/${hadithNumber.value}`,
	{
		lazy: true,
		server: false
	}
)

const isPending = computed(() => status.value === 'pending')

const arabicFontSize = ref<number>(28)
function decreaseFontSize() {
	if (arabicFontSize.value > 20) {
		arabicFontSize.value -= 2
	}
}
function increaseFontSize() {
	if (arabicFontSize.value < 44) {
		arabicFontSize.value += 2
	}
}

const isSaved = computed(() => {
	if (!hadith.value) return false
	return isBookmarked(narratorSlug.value, hadith.value.number)
})

const copied = ref(false)

async function copyHadith() {
	if (!hadith.value) return
	const text = `Hadits ${hadith.value.narrator.name} No. ${hadith.value.number}\n\n${hadith.value.arab}\n\nArtinya:\n"${hadith.value.id}"`
	try {
		await navigator.clipboard.writeText(text)
		copied.value = true
		toast.add({
			title: 'Berhasil Disalin',
			description: 'Teks hadits dan terjemahannya telah disalin.',
			color: 'success',
			icon: 'i-lucide-check'
		})
		setTimeout(() => {
			copied.value = false
		}, 2000)
	} catch (err) {
		console.error('Gagal menyalin:', err)
	}
}

function handleBookmark() {
	if (!hadith.value) return
	toggleBookmark({
		narratorSlug: hadith.value.narrator.slug,
		narratorName: hadith.value.narrator.name,
		number: hadith.value.number,
		arab: hadith.value.arab,
		id: hadith.value.id
	})

	toast.add({
		title: isSaved.value ? 'Disimpan ke Bookmark' : 'Dihapus dari Bookmark',
		description: `${hadith.value.narrator.name} #${hadith.value.number}`,
		color: isSaved.value ? 'primary' : 'neutral',
		icon: isSaved.value ? 'i-lucide-bookmark-check' : 'i-lucide-bookmark'
	})
}

async function shareHadith() {
	if (!hadith.value || !import.meta.client) return
	const shareData = {
		title: `Hadits ${hadith.value.narrator.name} No. ${hadith.value.number}`,
		text: `${hadith.value.narrator.name} #${hadith.value.number}: "${hadith.value.id.slice(0, 100)}..."`,
		url: window.location.href
	}

	if (navigator.share) {
		try {
			await navigator.share(shareData)
		} catch (err) {
			console.error('Batal membagikan:', err)
		}
	} else {
		await navigator.clipboard.writeText(window.location.href)
		toast.add({
			title: 'Tautan Disalin',
			description: 'Tautan hadits telah disalin ke clipboard.',
			color: 'primary',
			icon: 'i-lucide-copy'
		})
	}
}

useHead({
	title: computed(() =>
		hadith.value
			? `Hadits ${hadith.value.narrator.name} No. ${hadith.value.number}`
			: 'Detail Hadits'
	)
})
</script>

<template>
	<div
		class="container mx-auto px-4 py-8 max-w-4xl"
	>
		<div
			v-if="isPending"
			class="p-8 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 flex flex-col gap-6 animate-pulse"
		>
			<div
				class="flex justify-between"
			>
				<div
					class="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-md"
				/>
				<div
					class="h-6 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-md"
				/>
			</div>
			<div
				class="h-28 bg-neutral-200 dark:bg-neutral-800 rounded-md"
			/>
			<div
				class="h-16 bg-neutral-200 dark:bg-neutral-800 rounded-md"
			/>
		</div>

		<div
			v-else-if="error"
			class="p-10 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col items-center gap-4"
		>
			<UIcon
				name="i-lucide-alert-circle"
				class="size-10 text-red-500"
			/>
			<h2
				class="text-lg font-bold"
			>
				Hadits Tidak Ditemukan
			</h2>
			<p
				class="text-sm text-neutral-500 max-w-md"
			>
				Hadits nomor {{ hadithNumber }} dalam kitab {{ narratorSlug }} tidak ditemukan atau belum tersedia.
			</p>
			<UButton
				to="/"
				color="primary"
				variant="solid"
				icon="i-lucide-arrow-left"
			>
				Kembali ke Beranda
			</UButton>
		</div>

		<div
			v-else-if="hadith"
			class="flex flex-col gap-6"
		>
			<div
				class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
			>
				<nav
					class="flex items-center gap-2 text-xs text-neutral-500"
				>
					<NuxtLink
						to="/"
						class="hover:text-primary transition-colors flex items-center gap-1"
					>
						<UIcon
							name="i-lucide-home"
							class="size-3.5"
						/>
						Beranda
					</NuxtLink>
					<span>/</span>
					<NuxtLink
						:to="`/?perawi=${hadith.narrator.slug}`"
						class="hover:text-primary transition-colors"
					>
						{{ hadith.narrator.name }}
					</NuxtLink>
					<span>/</span>
					<span
						class="font-semibold text-neutral-800 dark:text-neutral-200"
					>
						Hadits #{{ hadith.number }}
					</span>
				</nav>

				<div
					class="flex items-center gap-1.5 self-end sm:self-auto"
				>
					<div
						class="flex items-center bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-0.5"
					>
						<UButton
							icon="i-lucide-minus"
							variant="ghost"
							color="neutral"
							size="xs"
							aria-label="Perkecil huruf Arab"
							:disabled="arabicFontSize <= 20"
							@click="decreaseFontSize"
						/>
						<span
							class="px-2 text-xs font-mono font-medium text-neutral-600 dark:text-neutral-300"
						>
							{{ arabicFontSize }}px
						</span>
						<UButton
							icon="i-lucide-plus"
							variant="ghost"
							color="neutral"
							size="xs"
							aria-label="Perbesar huruf Arab"
							:disabled="arabicFontSize >= 44"
							@click="increaseFontSize"
						/>
					</div>

					<UButton
						:icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
						:color="copied ? 'success' : 'neutral'"
						variant="subtle"
						size="sm"
						aria-label="Salin hadits"
						@click="copyHadith"
					>
						<span
							class="hidden sm:inline"
						>
							Salin
						</span>
					</UButton>

					<UButton
						:icon="isSaved ? 'i-lucide-bookmark-check' : 'i-lucide-bookmark'"
						:color="isSaved ? 'primary' : 'neutral'"
						:variant="isSaved ? 'solid' : 'subtle'"
						size="sm"
						aria-label="Simpan hadits"
						@click="handleBookmark"
					>
						<span
							class="hidden sm:inline"
						>
							{{ isSaved ? 'Tersimpan' : 'Simpan' }}
						</span>
					</UButton>

					<UButton
						icon="i-lucide-share-2"
						variant="subtle"
						color="neutral"
						size="sm"
						aria-label="Bagikan hadits"
						@click="shareHadith"
					/>
				</div>
			</div>

			<UCard
				class="p-6 md:p-8 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900 flex flex-col gap-6"
			>
				<div
					class="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800"
				>
					<div
						class="flex items-center gap-2"
					>
						<UBadge
							color="primary"
							variant="solid"
							size="md"
							class="font-bold"
						>
							{{ hadith.narrator.name }}
						</UBadge>
						<UBadge
							color="neutral"
							variant="subtle"
							size="md"
							class="font-mono"
						>
							No. {{ hadith.number }}
						</UBadge>
					</div>

					<span
						class="text-xs text-neutral-500 dark:text-neutral-400 font-mono"
					>
						Kutubut Tis'ah
					</span>
				</div>

				<div
					class="py-6 px-2 text-right"
				>
					<p
						class="font-arabic text-neutral-900 dark:text-neutral-50 select-text leading-[2.4]"
						:style="{ fontSize: `${arabicFontSize}px` }"
					>
						{{ hadith.arab }}
					</p>
				</div>

				<div
					class="relative flex py-2 items-center"
				>
					<div
						class="flex-grow border-t border-neutral-200 dark:border-neutral-800"
					/>
					<span
						class="flex-shrink mx-4 text-primary text-xs font-semibold uppercase tracking-widest flex items-center gap-1.5"
					>
						<UIcon
							name="i-lucide-languages"
							class="size-3.5"
						/>
						Terjemahan Bahasa Indonesia
					</span>
					<div
						class="flex-grow border-t border-neutral-200 dark:border-neutral-800"
					/>
				</div>

				<div
					class="py-2 px-2 text-neutral-700 dark:text-neutral-300 leading-relaxed text-base md:text-lg select-text"
				>
					<p>
						"{{ hadith.id }}"
					</p>
				</div>

				<div
					class="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400"
				>
					<div>
						Kitab: <strong class="text-neutral-700 dark:text-neutral-300">{{ hadith.narrator.name }}</strong> (Total {{ hadith.narrator.total.toLocaleString('id-ID') }} Hadits)
					</div>
					<div
						class="flex items-center gap-2"
					>
						<UButton
							:to="`/?perawi=${hadith.narrator.slug}`"
							variant="link"
							color="primary"
							size="xs"
							trailing-icon="i-lucide-chevron-right"
							class="p-0"
						>
							Lihat semua hadits {{ hadith.narrator.name }}
						</UButton>
					</div>
				</div>
			</UCard>

			<div
				class="flex items-center justify-between gap-4 py-2"
			>
				<UButton
					v-if="hadith.prevNumber"
					:to="`/${hadith.narrator.slug}/${hadith.prevNumber}`"
					variant="subtle"
					color="neutral"
					size="md"
					icon="i-lucide-arrow-left"
				>
					Hadits #{{ hadith.prevNumber }}
				</UButton>
				<div
					v-else
				/>

				<UButton
					to="/"
					variant="ghost"
					color="neutral"
					size="sm"
					icon="i-lucide-layout-grid"
				>
					Katalog
				</UButton>

				<UButton
					v-if="hadith.nextNumber"
					:to="`/${hadith.narrator.slug}/${hadith.nextNumber}`"
					variant="subtle"
					color="neutral"
					size="md"
					trailing-icon="i-lucide-arrow-right"
				>
					Hadits #{{ hadith.nextNumber }}
				</UButton>
				<div
					v-else
				/>
			</div>
		</div>
	</div>
</template>
