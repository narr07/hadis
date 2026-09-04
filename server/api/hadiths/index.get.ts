import { queryHadiths } from '../../utils/hadiths'

export default defineEventHandler((event) => {
	const query = getQuery(event)

	const narrator = query.narrator ? String(query.narrator) : undefined
	const search = query.search ? String(query.search) : undefined
	const page = query.page ? Number(query.page) : 1
	const limit = query.limit ? Number(query.limit) : 20
	const number = query.number ? Number(query.number) : undefined

	return queryHadiths({
		narrator,
		search,
		page,
		limit,
		number
	})
})
