import { getHadithDetailFromDb } from '../../../utils/d1-hadiths'

export default defineEventHandler(async (event) => {
	const narrator = getRouterParam(event, 'narrator')
	const numberParam = getRouterParam(event, 'number')

	if (!narrator || !numberParam) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Narrator and number are required'
		})
	}

	const hadithNumber = Number(numberParam)
	if (isNaN(hadithNumber)) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid hadith number'
		})
	}

	const hadith = await getHadithDetailFromDb(narrator, hadithNumber)
	if (!hadith) {
		throw createError({
			statusCode: 404,
			statusMessage: `Hadith #${hadithNumber} in ${narrator} not found`
		})
	}

	return hadith
})
