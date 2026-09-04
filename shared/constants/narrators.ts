import type { Narrator } from '../types/hadith'

export const NARRATORS: readonly Narrator[] = [
	{ name: 'Bukhari', slug: 'bukhari', total: 6638 },
	{ name: 'Muslim', slug: 'muslim', total: 4930 },
	{ name: 'Abu Dawud', slug: 'abu-dawud', total: 4419 },
	{ name: 'Tirmidzi', slug: 'tirmidzi', total: 3625 },
	{ name: 'Nasai', slug: 'nasai', total: 5364 },
	{ name: 'Ibnu Majah', slug: 'ibnu-majah', total: 4285 },
	{ name: 'Ahmad', slug: 'ahmad', total: 4305 },
	{ name: 'Malik', slug: 'malik', total: 1587 },
	{ name: 'Darimi', slug: 'darimi', total: 2949 }
] as const

export function findNarrator(slug: string): Narrator | undefined {
	return NARRATORS.find(n => n.slug === slug)
}
