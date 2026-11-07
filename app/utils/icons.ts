/**
 * Single source of truth for every icon used in the app. Check here before
 * picking an icon for a new usage — reuse an existing constant if the
 * concept already exists, rather than introducing a second icon for the
 * same idea.
 */
export const ICONS = {
  arrowLeft: 'i-lucide-arrow-left',
  arrowRight: 'i-lucide-arrow-right',
  externalLink: 'i-lucide-arrow-up-right',
  chevronDown: 'i-lucide-chevron-down',
  check: 'i-lucide-check',
  close: 'i-lucide-x',
  menu: 'i-lucide-menu',
  search: 'i-lucide-search',
  home: 'i-lucide-house',
  github: 'i-simple-icons-github',
  /** One flag per locale, keyed by locale code */
  flags: {
    it: 'i-circle-flags-it',
    en: 'i-circle-flags-gb'
  }
} as const
