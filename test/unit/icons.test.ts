import { describe, expect, it } from 'vitest'
import { ICONS } from '~/utils/icons'

// Every leaf of a nested icon map, so groups are checked too
function iconNames(group: object): string[] {
  return Object.values(group).flatMap(value => typeof value === 'string' ? [value] : iconNames(value))
}

describe('ICONS', () => {
  it('writes every name in the dash form the Nuxt Icon scan finds', () => {
    for (const name of iconNames(ICONS)) {
      expect(name).toMatch(/^i-[a-z0-9]+(-[a-z0-9]+)+$/)
    }
  })
})
