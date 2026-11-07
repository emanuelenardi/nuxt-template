<script setup lang="ts">
const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()

// The link to the same page in the other language
const otherLocale = computed(() => locales.value.find(entry => entry.code !== locale.value))
</script>

<template>
  <div>
    <UHeader :to="localePath('/')">
      <template #title>
        {{ t('site.name') }}
      </template>

      <template #right>
        <UButton
          v-if="otherLocale"
          :to="switchLocalePath(otherLocale.code)"
          :icon="ICONS.flags[otherLocale.code]"
          :label="otherLocale.name"
          color="neutral"
          variant="ghost"
        />
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          © {{ new Date().getFullYear() }} {{ t('site.name') }}
        </p>
      </template>
    </UFooter>
  </div>
</template>
