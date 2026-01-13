// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  // Ensure server routes work on Vercel
  nitro: {
    preset: 'vercel',
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Crystal Agent - Autonomous 3D World Builder',
      meta: [
        { name: 'description', content: 'Watch AI build 3D worlds in real-time' }
      ],
    }
  },

  runtimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  },

  typescript: {
    strict: true,
  },
})
