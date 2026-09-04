// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: [
		'@nuxthub/core',
		'@nuxt/eslint',
		'@nuxt/ui'
	],

	devtools: {
		enabled: true
	},

	app: {
		head: {
			title: 'Hadis - Ensiklopedia 9 Kitab Hadis',
			titleTemplate: '%s · Hadis',
			meta: [
				{ charset: 'utf-8' },
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
				{
					name: 'description',
					content: 'Jelajahi puluhan ribu hadis shahih dari 9 Imam Hadis (Kutubut Tis\'ah) dengan terjemahan bahasa Indonesia, pencarian cepat, dan simpan hadis favorit.'
				}
			],
			link: [
				{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
				{ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
				{
					rel: 'stylesheet',
					href: 'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Plus+Jakarta+Sans:ital,wght@0,400..700;1,400..700&display=swap'
				}
			]
		}
	},

	css: ['~/assets/css/main.css'],

	compatibilityDate: '2026-06-30',

	hub: {
		db: 'sqlite',
		cache: true
	},

	eslint: {
		config: {
			stylistic: {
				indent: 'tab',
				quotes: 'single',
				commaDangle: 'never',
				braceStyle: '1tbs'
			}
		}
	},

	icon: {
		serverBundle: {
			collections: ['lucide', 'simple-icons']
		}
	}
})
