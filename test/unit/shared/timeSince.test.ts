// @shared timeSince.test v1 (keep the copies identical: change it in personal/nuxt-template first, bump the number)
import { describe, expect, it } from 'vitest'
import {
  formatElapsed,
  formatUpdatedAt,
  formatUpdatedDate,
  timeSince
} from '#shared/utils/timeSince'

const NOW = new Date('2026-09-19T12:00:00Z')

function since(isoDate: string) {
  return timeSince(isoDate, NOW)
}

describe('timeSince', () => {
  it('reads under a minute as now', () => {
    expect(since('2026-09-19T11:59:30Z')).toEqual({ unit: 'now', count: 0 })
    expect(since('2026-09-19T12:00:00Z')).toEqual({ unit: 'now', count: 0 })
  })

  it('reads a date in the future as now, not a negative amount', () => {
    expect(since('2026-09-19T12:30:00Z')).toEqual({ unit: 'now', count: 0 })
  })

  it('uses minutes under an hour', () => {
    expect(since('2026-09-19T11:59:00Z')).toEqual({ unit: 'minutes', count: 1 })
    expect(since('2026-09-19T11:15:00Z')).toEqual({ unit: 'minutes', count: 45 })
    expect(since('2026-09-19T11:00:01Z')).toEqual({ unit: 'minutes', count: 59 })
  })

  it('uses hours from one hour up to a day, floored', () => {
    expect(since('2026-09-19T11:00:00Z')).toEqual({ unit: 'hours', count: 1 })
    expect(since('2026-09-19T08:30:00Z')).toEqual({ unit: 'hours', count: 3 })
    expect(since('2026-09-18T12:00:01Z')).toEqual({ unit: 'hours', count: 23 })
  })

  it('uses days from one day up to 30', () => {
    expect(since('2026-09-18T12:00:00Z')).toEqual({ unit: 'days', count: 1 })
    expect(since('2026-09-05T12:00:00Z')).toEqual({ unit: 'days', count: 14 })
    expect(since('2026-08-21T12:00:00Z')).toEqual({ unit: 'days', count: 29 })
  })

  it('uses months of 30 days under 365 days', () => {
    expect(since('2026-08-20T12:00:00Z')).toEqual({ unit: 'months', count: 1 })
    expect(since('2026-03-19T12:00:00Z')).toEqual({ unit: 'months', count: 6 })
    expect(since('2025-10-20T12:00:00Z')).toEqual({ unit: 'months', count: 11 })
  })

  it('uses years of 365 days from then on', () => {
    expect(since('2025-09-19T12:00:00Z')).toEqual({ unit: 'years', count: 1 })
    expect(since('2023-01-01T00:00:00Z')).toEqual({ unit: 'years', count: 3 })
  })

  it('returns null for an invalid date', () => {
    expect(since('')).toBeNull()
    expect(since('not a date')).toBeNull()
  })
})

describe('formatElapsed', () => {
  it('flags under a minute as now', () => {
    expect(formatElapsed('2026-09-19T11:59:40Z', NOW, 'en')).toEqual({ isNow: true, text: '' })
  })

  it('writes a relative time in the given language', () => {
    expect(formatElapsed('2026-09-19T07:00:00Z', NOW, 'en')).toEqual({
      isNow: false,
      text: '5 hours ago'
    })
    expect(formatElapsed('2026-09-19T07:00:00Z', NOW, 'it')?.text).toBe('5 ore fa')
    expect(formatElapsed('2026-09-18T12:00:00Z', NOW, 'en')?.text).toBe('1 day ago')
    expect(formatElapsed('2026-06-19T12:00:00Z', NOW, 'de')?.text).toBe('vor 3 Monaten')
  })

  it('is null for an invalid date', () => {
    expect(formatElapsed('nope', NOW, 'en')).toBeNull()
  })
})

describe('formatUpdatedAt', () => {
  it('writes the date and time in full, in the given language', () => {
    expect(formatUpdatedAt('2026-10-05T12:00:00Z', 'en')).toContain('October')
    expect(formatUpdatedAt('2026-10-05T12:00:00Z', 'it')).toContain('ottobre')
  })
})

describe('formatUpdatedDate', () => {
  it('writes the day in the given language', () => {
    expect(formatUpdatedDate('2026-10-11T08:30:00Z', 'en')).toBe('Oct 11, 2026')
    expect(formatUpdatedDate('2026-10-11T08:30:00Z', 'it')).toBe('11 ott 2026')
  })
})
