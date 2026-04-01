import { describe, it, expect } from 'vitest'
import { shuffle } from '../../utils'

describe('shuffle function', () => {
  it('should return an array of the same length', () => {
    const array = [1, 2, 3, 4, 5]
    const shuffled = shuffle(array)
    expect(shuffled).toHaveLength(array.length)
  })

  it('should contain the same elements', () => {
    const array = [1, 2, 3, 4, 5]
    const shuffled = shuffle(array)
    expect(shuffled.sort()).toEqual(array.sort())
  })

  it('should shuffle the array (not always the same order)', () => {
    const array = [1, 2, 3, 4, 5]
    const shuffled1 = shuffle([...array])
    const shuffled2 = shuffle([...array])
    expect(shuffled1).not.toEqual(shuffled2)
  })

  it('should handle empty array', () => {
    const array: any[] = []
    const shuffled = shuffle(array)
    expect(shuffled).toEqual([])
  })

  it('should handle single element array', () => {
    const array = [42]
    const shuffled = shuffle(array)
    expect(shuffled).toEqual([42])
  })
})