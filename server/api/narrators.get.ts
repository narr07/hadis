import { getNarrators } from '../utils/hadiths'

export default defineEventHandler(() => {
	const narrators = getNarrators()
	return {
		narrators
	}
})
