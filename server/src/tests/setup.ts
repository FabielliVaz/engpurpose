import { vi } from 'vitest'

vi.mock('../db/config', () => ({
  getDatabase: vi.fn(),
}))