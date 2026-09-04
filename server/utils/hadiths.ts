import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { NARRATORS } from '~~/shared/constants/narrators'
import type { HadithItem, HadithPageResponse, HadithWithNarrator, Narrator } from '~~/shared/types/hadith'

const hadithsCache = new Map<string, HadithItem[]>()

function getDataDir(): string | null {
	try {
		if (typeof process === 'undefined' || !process.cwd) {
			return null
		}
		const currentDir = process.cwd()
		const publicDataDir = resolve(currentDir, 'public/data/hadiths')
		if (existsSync(publicDataDir)) {
			return publicDataDir
		}
		const serverDataDir = resolve(currentDir, 'server/data/hadiths')
		if (existsSync(serverDataDir)) {
			return serverDataDir
		}
	} catch {
		// Environment without node:fs (e.g. edge worker)
	}
	return null
}

export function getNarrators(): readonly Narrator[] {
	return NARRATORS
}

export function getNarrator(slug: string): Narrator | undefined {
	return NARRATORS.find(n => n.slug === slug)
}

export function getHadithsForNarrator(slug: string): HadithItem[] {
	if (hadithsCache.has(slug)) {
		return hadithsCache.get(slug)!
	}

	try {
		const dataDir = getDataDir()
		if (dataDir) {
			const filePath = resolve(dataDir, `${slug}.json`)
			if (existsSync(filePath)) {
				const fileContent = readFileSync(filePath, 'utf-8')
				const items = JSON.parse(fileContent) as HadithItem[]
				hadithsCache.set(slug, items)
				return items
			}
		}
	} catch (err) {
		console.warn(`Could not load local filesystem hadiths for ${slug}:`, err)
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
			const defaultNarr = narrators[0]
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
