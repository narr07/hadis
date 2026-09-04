import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const hadiths = sqliteTable(
	'hadiths',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		narrator: text('narrator').notNull(),
		number: integer('number').notNull(),
		arab: text('arab').notNull(),
		translation: text('translation').notNull()
	},
	table => [
		index('narrator_idx').on(table.narrator),
		index('narrator_number_idx').on(table.narrator, table.number)
	]
)

export type HadithRecord = typeof hadiths.$inferSelect
export type NewHadithRecord = typeof hadiths.$inferInsert
