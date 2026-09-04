import type { LocationQueryRaw } from 'vue-router'

export function useHadithFilters() {
	const route = useRoute()
	const router = useRouter()

	const narrator = computed(() => (route.query.perawi as string) || 'bukhari')
	const searchQuery = computed(() => (route.query.q as string) || '')
	const numberQuery = computed(() => (route.query.no as string) || '')
	const viewMode = computed<'all' | 'bookmarks'>(
		() => (route.query.mode as 'all' | 'bookmarks') || 'all'
	)
	const page = computed(() => Math.max(1, Number(route.query.page) || 1))

	function updateFilters(
		updates: {
			perawi?: string
			q?: string
			no?: string
			mode?: 'all' | 'bookmarks'
			page?: number
		},
		options?: { replace?: boolean }
	) {
		const newQuery: LocationQueryRaw = {
			...route.query
		}

		if (updates.perawi !== undefined) {
			if (updates.perawi === 'bukhari') {
				delete newQuery.perawi
			} else {
				newQuery.perawi = updates.perawi
			}
			newQuery.page = undefined
		}

		if (updates.q !== undefined) {
			if (!updates.q) {
				delete newQuery.q
			} else {
				newQuery.q = updates.q
			}
			newQuery.page = undefined
		}

		if (updates.no !== undefined) {
			if (!updates.no) {
				delete newQuery.no
			} else {
				newQuery.no = updates.no
			}
			newQuery.page = undefined
		}

		if (updates.mode !== undefined) {
			if (updates.mode === 'all') {
				delete newQuery.mode
			} else {
				newQuery.mode = updates.mode
			}
			newQuery.page = undefined
		}

		if (updates.page !== undefined) {
			if (updates.page <= 1) {
				delete newQuery.page
			} else {
				newQuery.page = updates.page
			}
		}

		if (options?.replace) {
			return router.replace({
				path: '/',
				query: newQuery
			})
		}

		return router.push({
			path: '/',
			query: newQuery
		})
	}

	function resetFilters() {
		return router.push({
			path: '/',
			query: {}
		})
	}

	return {
		narrator,
		searchQuery,
		numberQuery,
		viewMode,
		page,
		updateFilters,
		resetFilters
	}
}
