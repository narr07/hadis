<script setup lang="ts">
import type { HadithWithNarrator } from '~~/server/utils/hadiths'

const props = defineProps<{
	hadith: HadithWithNarrator
}>()

const toast = useToast()
const { isBookmarked, toggleBookmark } = useBookmarks()
const copied = ref(false)

const isSaved = computed(() =>
	isBookmarked(props.hadith.narratorSlug, props.hadith.number)
)

async function copyHadith() {
	const text = `Hadits ${props.hadith.narratorName} No. ${props.hadith.number}\n\n${props.hadith.arab}\n\nArtinya:\n"${props.hadith.id}"`
	try {
		await navigator.clipboard.writeText(text)
		copied.value = true
		toast.add({
			title: 'Teks Hadits Disalin',
			description: `${props.hadith.narratorName} #${props.hadith.number} berhasil disalin ke papan klip.`,
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
	toggleBookmark({
		narratorSlug: props.hadith.narratorSlug,
		narratorName: props.hadith.narratorName,
		number: props.hadith.number,
		arab: props.hadith.arab,
		id: props.hadith.id
	})

	toast.add({
		title: isSaved.value ? 'Disimpan ke Bookmark' : 'Dihapus dari Bookmark',
		description: `${props.hadith.narratorName} #${props.hadith.number}`,
		color: isSaved.value ? 'primary' : 'neutral',
		icon: isSaved.value ? 'i-lucide-bookmark-check' : 'i-lucide-bookmark'
	})
}
</script>

<template>
	<UCard
		class="group flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-primary/40 border border-neutral-200 dark:border-neutral-800 rounded-xl"
	>
		<template #header>
			<div
				class="flex items-center justify-between gap-2"
			>
				<div
					class="flex items-center gap-2"
				>
					<UBadge
						color="primary"
						variant="subtle"
						size="sm"
						class="font-semibold"
					>
						{{ hadith.narratorName }}
					</UBadge>
					<UBadge
						color="neutral"
						variant="outline"
						size="sm"
					>
						#{{ hadith.number }}
					</UBadge>
				</div>

				<div
					class="flex items-center gap-1"
				>
					<UButton
						:icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
						:color="copied ? 'success' : 'neutral'"
						variant="ghost"
						size="sm"
						aria-label="Salin teks hadits"
						class="min-h-9 min-w-9"
						@click="copyHadith"
					/>
					<UButton
						:icon="isSaved ? 'i-lucide-bookmark-check' : 'i-lucide-bookmark'"
						:color="isSaved ? 'primary' : 'neutral'"
						:variant="isSaved ? 'solid' : 'ghost'"
						size="sm"
						aria-label="Simpan hadits"
						class="min-h-9 min-w-9"
						@click="handleBookmark"
					/>
				</div>
			</div>
		</template>

		<div
			class="mb-4"
		>
			<p
				class="font-arabic text-xl md:text-2xl text-neutral-800 dark:text-neutral-100 line-clamp-3 select-text"
			>
				{{ hadith.arab }}
			</p>
		</div>

		<div
			class="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-3 select-text"
		>
			{{ hadith.id }}
		</div>

		<template #footer>
			<div
				class="flex items-center justify-between pt-1"
			>
				<span
					class="text-xs text-neutral-500 dark:text-neutral-400"
				>
					Kutubut Tis'ah
				</span>
				<UButton
					:to="`/${hadith.narratorSlug}/${hadith.number}`"
					variant="ghost"
					color="primary"
					size="sm"
					trailing-icon="i-lucide-chevron-right"
					class="font-medium group-hover:translate-x-0.5 transition-transform"
				>
					Baca Selengkapnya
				</UButton>
			</div>
		</template>
	</UCard>
</template>
