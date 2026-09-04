export interface BookmarkedHadith {
	id: string
	narratorSlug: string
	narratorName: string
	number: number
	arab: string
	idText: string
	bookmarkedAt: number
}

export function useBookmarks() {
	const bookmarks = useState<BookmarkedHadith[]>('hadith-bookmarks', () => [])
	const isInitialized = useState<boolean>('hadith-bookmarks-init', () => false)

	if (import.meta.client && !isInitialized.value) {
		try {
			const stored = localStorage.getItem('hadith-bookmarks')
			if (stored) {
				bookmarks.value = JSON.parse(stored)
			}
		} catch (err) {
			console.error('Failed to read bookmarks from localStorage:', err)
		}
		isInitialized.value = true
	}

	function saveToStorage() {
		if (import.meta.client) {
			try {
				localStorage.setItem('hadith-bookmarks', JSON.stringify(bookmarks.value))
			} catch (err) {
				console.error('Failed to save bookmarks to localStorage:', err)
			}
		}
	}

	function isBookmarked(narratorSlug: string, number: number): boolean {
		const key = `${narratorSlug}-${number}`
		return bookmarks.value.some(b => b.id === key)
	}

	function toggleBookmark(hadith: {
		narratorSlug: string
		narratorName: string
		number: number
		arab: string
		id: string
	}) {
		const key = `${hadith.narratorSlug}-${hadith.number}`
		const index = bookmarks.value.findIndex(b => b.id === key)

		if (index >= 0) {
			bookmarks.value.splice(index, 1)
		} else {
			bookmarks.value.unshift({
				id: key,
				narratorSlug: hadith.narratorSlug,
				narratorName: hadith.narratorName,
				number: hadith.number,
				arab: hadith.arab,
				idText: hadith.id,
				bookmarkedAt: Date.now()
			})
		}
		saveToStorage()
	}

	function removeBookmark(narratorSlug: string, number: number) {
		const key = `${narratorSlug}-${number}`
		bookmarks.value = bookmarks.value.filter(b => b.id !== key)
		saveToStorage()
	}

	return {
		bookmarks,
		isBookmarked,
		toggleBookmark,
		removeBookmark
	}
}
