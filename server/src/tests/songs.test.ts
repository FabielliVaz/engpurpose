import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import songsRouter from '../routes/songs'
import { getDatabase } from '../db/config'

const app = express()
app.use(express.json())
app.use('/api/songs', songsRouter)

describe('Songs API', () => {
  const mockGetDatabase = vi.mocked(getDatabase)

  beforeEach(() => {
    mockGetDatabase.mockClear()
    mockGetDatabase.mockResolvedValue({
      select: vi.fn(() => ({
        from: vi.fn(() => Promise.resolve([{ id: 1, title: 'Test Song', artist: 'Test Artist' }])),
      })),
    })
  })

  it('should return a list of songs', async () => {
    const response = await request(app).get('/api/songs')
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })

  it('should return a specific song by id', async () => {
    mockGetDatabase.mockResolvedValue({
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([{ id: 1, title: 'Test Song', artist: 'Test Artist' }])),
        })),
      })),
    })

    const response = await request(app).get('/api/songs/1')
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('title')
  })

  it('should return 404 for non-existent song', async () => {
    mockGetDatabase.mockResolvedValue({
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve([])), 
        })),
      })),
    })

    const response = await request(app).get('/api/songs/999')
    expect(response.status).toBe(404)
  })

  it('should return 500 on database error', async () => {
    mockGetDatabase.mockRejectedValue(new Error('Database connection failed'))

    const response = await request(app).get('/api/songs/1')
    expect(response.status).toBe(500)
  })
})