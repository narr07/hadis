import { and, count, eq, like, sql } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { findNarrator, NARRATORS } from '~~/shared/constants/narrators'
import type { HadithWithNarrator } from '~~/shared/types/hadith'

export interface HadithsQueryFilter {
	narrator?: string
	page?: number
	limit?: number
	search?: string
	number?: number
}

export async function queryHadithsFromDb(params: HadithsQueryFilter) {
	const page = Math.max(1, Number(params.page) || 1)
	const limit = Math.min(50, Math.max(1, Number(params.limit) || 15))
	const narratorSlug = params.narrator && params.narrator !== 'all' ? params.narrator : 'bukhari'
	const activeNarrator = findNarrator(narratorSlug) || NARRATORS[0]
	const search = params.search?.trim().toLowerCase()
	const targetNumber = params.number ? Number(params.number) : undefined

	const conditions = [eq(schema.hadiths.narrator, activeNarrator.slug)]

	if (targetNumber) {
		conditions.push(eq(schema.hadiths.number, targetNumber))
	} else if (search) {
		const numSearch = Number(search.replace(/^#/, ''))
		if (!isNaN(numSearch) && numSearch > 0) {
			conditions.push(
				sql`(${schema.hadiths.number} = ${numSearch} OR ${schema.hadiths.translation} LIKE ${`%${search}%`})`
			)
		} else {
			conditions.push(like(schema.hadiths.translation, `%${search}%`))
		}
	}

	const whereClause = and(...conditions)
	const offset = (page - 1) * limit

	const rows = await db
		.select({
			id: schema.hadiths.id,
			number: schema.hadiths.number,
			arab: schema.hadiths.arab,
			translation: schema.hadiths.translation
		})
		.from(schema.hadiths)
		.where(whereClause)
		.orderBy(schema.hadiths.number)
		.limit(limit + 1)
		.offset(offset)

	const hasNext = rows.length > limit
	const pageItems = rows.slice(0, limit)

	const items: HadithWithNarrator[] = pageItems.map(r => ({
		number: r.number,
		arab: r.arab,
		id: r.translation,
		narratorSlug: activeNarrator.slug,
		narratorName: activeNarrator.name
	}))

	return {
		narrator: activeNarrator,
		page,
		limit,
		hasNext,
		hasPrev: page > 1,
		items
	}
}

export async function countHadithsFromDb(params: HadithsQueryFilter): Promise<number> {
	const narratorSlug = params.narrator && params.narrator !== 'all' ? params.narrator : 'bukhari'
	const activeNarrator = findNarrator(narratorSlug) || NARRATORS[0]
	const search = params.search?.trim().toLowerCase()
	const targetNumber = params.number ? Number(params.number) : undefined

	if (!search && !targetNumber) {
		return activeNarrator.total
	}

	const conditions = [eq(schema.hadiths.narrator, activeNarrator.slug)]

	if (targetNumber) {
		conditions.push(eq(schema.hadiths.number, targetNumber))
	} else if (search) {
		const numSearch = Number(search.replace(/^#/, ''))
		if (!isNaN(numSearch) && numSearch > 0) {
			conditions.push(
				sql`(${schema.hadiths.number} = ${numSearch} OR ${schema.hadiths.translation} LIKE ${`%${search}%`})`
			)
		} else {
			conditions.push(like(schema.hadiths.translation, `%${search}%`))
		}
	}

	const whereClause = and(...conditions)
	const [result] = await db.select({ total: count() }).from(schema.hadiths).where(whereClause)
	return result?.total ?? 0
}

export async function getHadithDetailFromDb(narratorSlug: string, number: number) {
	const activeNarrator = findNarrator(narratorSlug)
	if (!activeNarrator) return null

	const rows = await db
		.select({
			number: schema.hadiths.number,
			arab: schema.hadiths.arab,
			translation: schema.hadiths.translation
		})
		.from(schema.hadiths)
		.where(
			and(
				eq(schema.hadiths.narrator, activeNarrator.slug),
				sql`${schema.hadiths.number} IN (${number - 1}, ${number}, ${number + 1})`
			)
		)

	const current = rows.find(r => r.number === number)
	if (!current) return null

	const prev = rows.find(r => r.number === number - 1)
	const next = rows.find(r => r.number === number + 1)

	return {
		number: current.number,
		arab: current.arab,
		id: current.translation,
		narrator: activeNarrator,
		prevNumber: prev ? prev.number : null,
		nextNumber: next ? next.number : null
	}
}
