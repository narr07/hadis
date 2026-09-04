<script setup lang="ts">
useHead({
	meta: [
		{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
		{ name: 'theme-color', content: '#10b981' }
	],
	link: [
		{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
		{ rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
		{ rel: 'icon', href: '/favicon.ico' },
		{ rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
		{ rel: 'manifest', href: '/site.webmanifest' }
	],
	htmlAttrs: {
		lang: 'id'
	}
})

const title = 'Hadis - Ensiklopedia 9 Kitab Hadis'
const description
	= 'Jelajahi puluhan ribu hadis dari 9 Imam Hadis (Kutubut Tis\'ah) lengkap dengan teks Arab berharakat, terjemahan Indonesia, dan fitur pencarian canggih.'

useSeoMeta({
	title,
	description,
	ogTitle: title,
	ogDescription: description,
	ogType: 'website'
})
</script>

<template>
	<UApp>
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</UApp>
</template>
