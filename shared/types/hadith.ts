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
