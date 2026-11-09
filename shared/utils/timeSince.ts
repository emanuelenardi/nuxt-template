// @shared timeSince v1 (keep the copies identical: change it in personal/nuxt-template first, bump the number)
export type TimeSinceUnit = 'now' | 'minutes' | 'hours' | 'days' | 'months' | 'years'

export interface TimeSince {
  unit: TimeSinceUnit
  count: number
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const RELATIVE_UNITS = {
  minutes: 'minute',
  hours: 'hour',
  days: 'day',
  months: 'month',
  years: 'year'
} as const

// "How long ago" as one unit: minutes under an hour, hours under a day, days under a month,
// months under a year, then years. Whole units only; a month is 30 days and a year 365.
// Returns null for an invalid date.
export function timeSince(isoDate: string, now: Date = new Date()): TimeSince | null {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  // A date in the future (clock skew) reads as "just now" rather than negative
  const elapsed = Math.max(now.getTime() - date.getTime(), 0)

  if (elapsed < MINUTE) {
    return { unit: 'now', count: 0 }
  }
  if (elapsed < HOUR) {
    return { unit: 'minutes', count: Math.floor(elapsed / MINUTE) }
  }
  if (elapsed < DAY) {
    return { unit: 'hours', count: Math.floor(elapsed / HOUR) }
  }

  const days = Math.floor(elapsed / DAY)
  if (days < 30) {
    return { unit: 'days', count: days }
  }
  if (days < 365) {
    return { unit: 'months', count: Math.floor(days / 30) }
  }
  return { unit: 'years', count: Math.floor(days / 365) }
}

// How long ago, written in the given locale ("3 hours ago"); null when the date is not valid.
// `isNow` is true under a minute, where the caller shows its own "just now" wording.
export function formatElapsed(
  isoDate: string,
  now: Date,
  locale: string
): { isNow: boolean, text: string } | null {
  const since = timeSince(isoDate, now)
  if (!since) {
    return null
  }
  if (since.unit === 'now') {
    return { isNow: true, text: '' }
  }
  const relativeFormat = new Intl.RelativeTimeFormat(locale, { numeric: 'always' })
  return { isNow: false, text: relativeFormat.format(-since.count, RELATIVE_UNITS[since.unit]) }
}

// The day only ("11 Oct 2026"), for a label where the hour does not matter
export function formatUpdatedDate(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(isoDate))
}

// The exact moment, for the tooltip
export function formatUpdatedAt(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' })
    .format(new Date(isoDate))
}
