<script setup lang="ts">
import { en, it } from '@nuxt/ui/locale'

const { t, locale } = useI18n()

const uiLocale = computed(() => ({ it, en })[locale.value])

// @nuxtjs/i18n only computes the lang attribute: useHead writes it on <html>
const i18nHead = useLocaleHead()
useHead(() => ({ htmlAttrs: { lang: i18nHead.value.htmlAttrs?.lang } }))

useSeoMeta({ description: () => t('meta.description') })
</script>

<template>
  <UApp :locale="uiLocale">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
