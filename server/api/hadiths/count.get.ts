import { countHadithsFromDb } from '../../utils/d1-hadiths'

export default defineCachedEventHandler(
	async (event) => {
		const query = getQuery(event)

		const narrator = query.narrator ? String(query.narrator) : 'bukhari'
		const search = query.search ? String(query.search) : undefined
		const number = query.number ? Number(query.number) : undefined

		const total = await countHadithsFromDb({
			narrator,
			search,
			number
		})

		return { total }
	},
	{
		getKey: (event) => {
			const q = getQuery(event)
			return `hadiths-count-${q.narrator || 'bukhari'}-${q.search || ''}-${q.number || ''}`
		},
		maxAge: 60 * 60,
		name: 'hadiths-count',
		swr: true
	}
)
