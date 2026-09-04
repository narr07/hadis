import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

export interface Narrator {
	name: string
	slug: string
	total: number
}

export interface HadithItem {
	number: number
	arab: string
	id: string
}

export interface HadithWithNarrator extends HadithItem {
	narratorSlug: string
	narratorName: string
}

export interface HadithPageResponse {
	narrator?: Narrator | null
	total: number
	page: number
	limit: number
	totalPages: number
	hasNext: boolean
	hasPrev: boolean
	items: HadithWithNarrator[]
}

const narratorsCache: Narrator[] = []
const hadithsCache = new Map<string, HadithItem[]>()

function getDataDir(): string {
	const currentDir = process.cwd()
	const serverDataDir = resolve(currentDir, 'server/data/hadiths')
	if (existsSync(serverDataDir)) {
		return serverDataDir
	}
	// Fallback during dev or build if path differs
	return resolve(currentDir, '.output/server/data/hadiths')
}

export function getNarrators(): Narrator[] {
	if (narratorsCache.length > 0) {
		return narratorsCache
	}

	try {
		const listPath = resolve(getDataDir(), 'list.json')
		if (existsSync(listPath)) {
			const data = JSON.parse(readFileSync(listPath, 'utf-8')) as Narrator[]
			narratorsCache.push(...data)
			return narratorsCache
		}
	} catch (err) {
		console.error('Failed to load narrators list.json:', err)
	}

	return []
}

export function getNarrator(slug: string): Narrator | undefined {
	const narrators = getNarrators()
	return narrators.find(n => n.slug === slug)
}

export function getHadithsForNarrator(slug: string): HadithItem[] {
	if (hadithsCache.has(slug)) {
		return hadithsCache.get(slug)!
	}

	try {
		const filePath = resolve(getDataDir(), `${slug}.json`)
		if (existsSync(filePath)) {
			const fileContent = readFileSync(filePath, 'utf-8')
			const items = JSON.parse(fileContent) as HadithItem[]
			hadithsCache.set(slug, items)
			return items
		}
	} catch (err) {
		console.error(`Failed to load hadith file for ${slug}:`, err)
	}

	return []
}

export interface QueryHadithsParams {
	narrator?: string
	search?: string
	page?: number
	limit?: number
	number?: number
}

export function queryHadiths(params: QueryHadithsParams): HadithPageResponse {
	const page = Math.max(1, Number(params.page) || 1)
	const limit = Math.min(50, Math.max(1, Number(params.limit) || 20))
	const narratorSlug = params.narrator && params.narrator !== 'all' ? params.narrator : undefined
	const searchQuery = params.search?.trim().toLowerCase() || ''
	const targetNumber = params.number ? Number(params.number) : undefined

	const narrators = getNarrators()
	const activeNarrator = narratorSlug ? getNarrator(narratorSlug) : null

	let pool: HadithWithNarrator[] = []

	if (activeNarrator) {
		const list = getHadithsForNarrator(activeNarrator.slug)
		pool = list.map(item => ({
			...item,
			narratorSlug: activeNarrator.slug,
			narratorName: activeNarrator.name
		}))
	} else {
		// When "all" or not specified, we can load either all narrators or Bukhari by default if no query
		if (searchQuery) {
			for (const narr of narrators) {
				const list = getHadithsForNarrator(narr.slug)
				for (const item of list) {
					pool.push({
						...item,
						narratorSlug: narr.slug,
						narratorName: narr.name
					})
				}
			}
		} else {
			// Default to first narrator (bukhari) if pool is empty
			const defaultNarr = narrators[0] || { name: 'Bukhari', slug: 'bukhari', total: 6638 }
			const list = getHadithsForNarrator(defaultNarr.slug)
			pool = list.map(item => ({
				...item,
				narratorSlug: defaultNarr.slug,
				narratorName: defaultNarr.name
			}))
		}
	}

	let filtered = pool

	if (targetNumber) {
		filtered = filtered.filter(h => h.number === targetNumber)
	} else if (searchQuery) {
		// Check if search query is purely a number
		const numSearch = Number(searchQuery.replace(/^#/, ''))
		if (!isNaN(numSearch) && numSearch > 0) {
			filtered = filtered.filter(
				h => h.number === numSearch || h.id.toLowerCase().includes(searchQuery)
			)
		} else {
			filtered = filtered.filter(h => h.id.toLowerCase().includes(searchQuery))
		}
	}

	const total = filtered.length
	const totalPages = Math.ceil(total / limit) || 1
	const offset = (page - 1) * limit
	const items = filtered.slice(offset, offset + limit)

	return {
		narrator: activeNarrator,
		total,
		page,
		limit,
		totalPages,
		hasNext: page < totalPages,
		hasPrev: page > 1,
		items
	}
}

export function getHadithDetail(narratorSlug: string, hadithNumber: number) {
	const narrator = getNarrator(narratorSlug)
	if (!narrator) {
		return null
	}

	const list = getHadithsForNarrator(narratorSlug)
	const index = list.findIndex(h => h.number === hadithNumber)
	if (index === -1) {
		return null
	}

	const hadith = list[index]
	const prevHadith = index > 0 ? list[index - 1] : null
	const nextHadith = index < list.length - 1 ? list[index + 1] : null

	return {
		...hadith,
		narrator,
		prevNumber: prevHadith ? prevHadith.number : null,
		nextNumber: nextHadith ? nextHadith.number : null
	}
}
