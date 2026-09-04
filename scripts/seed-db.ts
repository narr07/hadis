import { Database } from 'bun:sqlite'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const dbPath = resolve(process.cwd(), '.data/db/sqlite.db')
if (!existsSync(dbPath)) {
	console.error('Database file not found at:', dbPath)
	process.exit(1)
}

const db = new Database(dbPath)

// Enable WAL mode for high performance
db.run('PRAGMA journal_mode = WAL;')
db.run('PRAGMA synchronous = NORMAL;')

// Clear existing hadiths to make seed idempotent
db.run('DELETE FROM hadiths;')

const insert = db.prepare(`
	INSERT INTO hadiths (narrator, number, arab, translation)
	VALUES ($narrator, $number, $arab, $translation)
`)

const dataDir = resolve(process.cwd(), 'public/data/hadiths')
const files = [
	'bukhari.json',
	'muslim.json',
	'abu-dawud.json',
	'tirmidzi.json',
	'nasai.json',
	'ibnu-majah.json',
	'ahmad.json',
	'malik.json',
	'darimi.json'
]

console.log('Seeding SQLite database with Kutubut Tis\'ah hadiths...')

db.run('BEGIN TRANSACTION;')

let totalInserted = 0

for (const file of files) {
	const slug = file.replace('.json', '')
	const filePath = resolve(dataDir, file)
	if (!existsSync(filePath)) {
		console.warn(`File ${file} not found, skipping`)
		continue
	}

	const content = readFileSync(filePath, 'utf-8')
	const items = JSON.parse(content) as Array<{ number: number, arab: string, id: string }>
	console.log(`Inserting ${items.length.toLocaleString('id-ID')} hadiths from ${slug}...`)

	for (const item of items) {
		insert.run({
			$narrator: slug,
			$number: item.number,
			$arab: item.arab,
			$translation: item.id
		})
		totalInserted++
	}
}

db.run('COMMIT;')

console.log(`Successfully seeded ${totalInserted.toLocaleString('id-ID')} hadiths into .data/db/sqlite.db!`)
