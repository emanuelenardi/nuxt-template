<script setup lang="ts">
import { en, it } from '@nuxt/ui/locale'
import type { NuxtError } from '#app'

// Replaces app.vue, so it sets its own UI locale, lang and title
const { error } = defineProps<{
  error: NuxtError
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const i18nHead = useLocaleHead()

const uiLocale = computed(() => ({ it, en })[locale.value])
const notFound = computed(() => error.status === 404)
const title = computed(() => notFound.value ? t('error.notFoundTitle') : t('error.genericTitle'))
const description = computed(() => {
  return notFound.value ? t('error.notFoundDescription') : t('error.genericDescription')
})

useHead(() => ({ htmlAttrs: { lang: i18nHead.value.htmlAttrs?.lang } }))
useSeoMeta({
  title,
  robots: 'noindex, nofollow'
})
</script>

<template>
  <UApp :locale="uiLocale">
    <NuxtLayout>
      <!-- A div: the layout already renders the page's <main> -->
      <UError
        as="div"
        :error="error"
        :redirect="localePath('/')"
      >
        <template #statusMessage>
          {{ title }}
        </template>
        <template #message>
          {{ description }}
        </template>
      </UError>
    </NuxtLayout>
  </UApp>
</template>
