<script setup lang="ts">
const props = defineProps<{
	page: number
	totalPages: number
	total: number
	hasNext: boolean
	hasPrev: boolean
	pending?: boolean
}>()

const emit = defineEmits<{
	changePage: [page: number]
}>()

function goToPage(p: number) {
	if (p >= 1 && p <= props.totalPages && p !== props.page) {
		emit('changePage', p)
		if (import.meta.client) {
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}
	}
}
</script>

<template>
	<div
		class="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-neutral-200/80 dark:border-neutral-800"
	>
		<div
			class="text-xs text-neutral-500"
		>
			Menampilkan halaman
			<span
				class="font-semibold text-neutral-800 dark:text-neutral-200 font-mono"
			>
				{{ page }}
			</span>
			dari
			<span
				class="font-semibold text-neutral-800 dark:text-neutral-200 font-mono"
			>
				{{ totalPages }}
			</span>
			(Total
			<span
				class="font-semibold text-neutral-800 dark:text-neutral-200 font-mono"
			>
				{{ total.toLocaleString('id-ID') }}
			</span>
			hadits)
		</div>

		<div
			class="flex items-center gap-2"
		>
			<UButton
				:disabled="!hasPrev || pending"
				variant="subtle"
				color="neutral"
				size="sm"
				icon="i-lucide-chevron-left"
				@click="goToPage(page - 1)"
			>
				Sebelumnya
			</UButton>

			<div
				class="flex items-center gap-1 px-2 text-xs font-mono font-medium text-neutral-600 dark:text-neutral-400"
			>
				{{ page }} / {{ totalPages }}
			</div>

			<UButton
				:disabled="!hasNext || pending"
				variant="subtle"
				color="neutral"
				size="sm"
				trailing-icon="i-lucide-chevron-right"
				@click="goToPage(page + 1)"
			>
				Selanjutnya
			</UButton>
		</div>
	</div>
</template>
