import { NARRATORS, findNarrator } from '~~/shared/constants/narrators'
import type { HadithItem, Narrator } from '~~/shared/types/hadith'

export interface HadithDetailData {
	number: number
	arab: string
	id: string
	narrator: Narrator
	prevNumber: number | null
	nextNumber: number | null
}

export function useHadithData() {
	// In-memory cache for loaded narrator datasets across navigations
	const cache = useState<Record<string, HadithItem[]>>('hadiths_dataset_cache', () => ({}))
	const loading = ref(false)
	const error = ref<Error | null>(null)

	async function loadNarratorHadiths(slug: string): Promise<HadithItem[]> {
		if (cache.value[slug] && cache.value[slug].length > 0) {
			return cache.value[slug]
		}

		loading.value = true
		error.value = null

		try {
			// Fetch static asset served directly from Cloudflare Edge CDN
			const data = await $fetch<HadithItem[]>(`/data/hadiths/${slug}.json`)
			cache.value[slug] = data
			return data
		} catch (err: unknown) {
			const e = err instanceof Error ? err : new Error(`Gagal memuat kitab ${slug}`)
			error.value = e
			throw e
		} finally {
			loading.value = false
		}
	}

	async function getHadithDetail(slug: string, number: number): Promise<HadithDetailData | null> {
		const narrator = findNarrator(slug)
		if (!narrator) {
			return null
		}

		const items = await loadNarratorHadiths(slug)
		const index = items.findIndex(h => h.number === number)
		if (index === -1) {
			return null
		}

		const hadith = items[index]
		const prevHadith = index > 0 ? items[index - 1] : null
		const nextHadith = index < items.length - 1 ? items[index + 1] : null

		return {
			...hadith,
			narrator,
			prevNumber: prevHadith ? prevHadith.number : null,
			nextNumber: nextHadith ? nextHadith.number : null
		}
	}

	return {
		narrators: NARRATORS,
		loading,
		error,
		loadNarratorHadiths,
		getHadithDetail
	}
}
