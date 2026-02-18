import { describe, it, expect } from 'vitest'
import { formatDuration, getDifficultyColor } from '../../pages/Songs'

describe('Songs Page Logic', () => {
  
  describe('formatDuration()', () => {
    it('deve formatar 269 segundos corretamente (Yellow)', () => {
      expect(formatDuration(269)).toBe('4:29')
    })

    it('deve adicionar zero à esquerda nos segundos (ex: 3:05)', () => {
      expect(formatDuration(185)).toBe('3:05')
    })

    it('deve retornar "-" para valores nulos ou zero', () => {
      expect(formatDuration(null)).toBe('-')
      expect(formatDuration(0)).toBe('-')
    })
  })

  describe('getDifficultyColor()', () => {
    it('deve retornar classes verdes para o nível A2 (Fácil)', () => {
      const result = getDifficultyColor('A2')
      expect(result).toContain('bg-green-100')
      expect(result).toContain('text-green-800')
    })

    it('deve retornar classes amarelas para o nível B1 (Intermediário)', () => {
      expect(getDifficultyColor('B1')).toBe('bg-yellow-100 text-yellow-800')
    })

    it('deve ser insensível a maiúsculas/minúsculas (case-insensitive)', () => {
      expect(getDifficultyColor('b2')).toBe('bg-red-100 text-red-800')
    })
  })
})