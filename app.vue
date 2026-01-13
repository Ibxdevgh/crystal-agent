<script setup lang="ts">
useHead({
  title: 'Crystal Agent - Autonomous 3D World Builder',
  meta: [
    { name: 'description', content: 'Watch AI build 3D worlds in real-time' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  link: [
    { rel: 'icon', type: 'image/png', href: '/favicon.png' },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
html, body, #__nuxt {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
