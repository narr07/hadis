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

const batchSize = 100
const chunks: string[] = []

chunks.push('-- Kutubut Tis\'ah Seed Data for Cloudflare D1\n')

for (let i = 0; i < rows.length; i += batchSize) {
  const slice = rows.slice(i, i + batchSize)
  const values = slice
    .map(r => `('${escapeSql(r.narrator)}', ${r.number}, '${escapeSql(r.arab)}', '${escapeSql(r.translation)}')`)
    .join(',\n')

  chunks.push(`INSERT INTO hadiths (narrator, number, arab, translation) VALUES\n${values};\n`)
}

const outputPath = resolve(process.cwd(), 'seed.sql')
writeFileSync(outputPath, chunks.join('\n'), 'utf-8')

console.log(`Successfully generated seed.sql (${(outputPath)}). Ready for: npx wrangler d1 execute hadis-db --remote --file=seed.sql`)
