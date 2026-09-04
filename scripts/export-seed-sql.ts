import { Database } from 'bun:sqlite'
import { resolve } from 'node:path'
import { writeFileSync } from 'node:fs'

const dbPath = resolve(process.cwd(), '.data/db/sqlite.db')
const db = new Database(dbPath)

console.log('Exporting SQLite records to seed.sql for Cloudflare D1...')

const rows = db.query('SELECT narrator, number, arab, translation FROM hadiths ORDER BY id ASC').all() as Array<{
	narrator: string
	number: number
	arab: string
	translation: string
}>

console.log(`Read ${rows.length.toLocaleString('id-ID')} rows from SQLite.`)

function escapeSql(str: string): string {
	return str.replace(/'/g, '\'\'')
}

const chunks: string[] = []

chunks.push(`-- Kutubut Tis'ah D1 Schema and Seed Data
CREATE TABLE IF NOT EXISTS hadiths (
	id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	narrator text NOT NULL,
	number integer NOT NULL,
	arab text NOT NULL,
	translation text NOT NULL
);
CREATE INDEX IF NOT EXISTS narrator_idx ON hadiths (narrator);
CREATE INDEX IF NOT EXISTS narrator_number_idx ON hadiths (narrator, number);
`)

for (const r of rows) {
	chunks.push(`INSERT INTO hadiths (narrator, number, arab, translation) VALUES ('${escapeSql(r.narrator)}', ${r.number}, '${escapeSql(r.arab)}', '${escapeSql(r.translation)}');`)
}

const outputPath = resolve(process.cwd(), 'seed.sql')
writeFileSync(outputPath, chunks.join('\n'), 'utf-8')

console.log(`Successfully generated seed.sql (${(outputPath)}). Ready for: npx wrangler d1 execute hadis-db --remote --file=seed.sql`)
