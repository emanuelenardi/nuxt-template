<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({ title: () => t('home.title') })
</script>

<template>
  <UPageHero
    :title="t('home.title')"
    :description="t('home.description')"
  />
</template>
