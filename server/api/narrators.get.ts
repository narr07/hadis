import { NARRATORS } from '~~/shared/constants/narrators'

export default defineEventHandler(() => {
	return {
		narrators: NARRATORS
	}
})
