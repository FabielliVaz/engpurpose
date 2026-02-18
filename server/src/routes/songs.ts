import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { getDatabase } from '../db/config'
import { songs } from '../db/schema.js'

const router: Router = Router()

/**
 * @swagger
 * /api/songs:
 * get:
 * summary: Lista todas as músicas
 * description: Retorna a biblioteca completa, removendo campos nulos para uma resposta limpa.
 * tags: [Songs]
 * responses:
 * 200:
 * description: Lista de músicas recuperada com sucesso.
 */
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase()
    const allSongs = await db.select().from(songs)

    const cleanSongs = allSongs.map((song: any) =>
      Object.fromEntries(Object.entries(song).filter(([_, v]) => v !== null))
    )

    res.json(cleanSongs)
  } catch (error) {
    console.error('Erro ao listar músicas:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

/**
 * @swagger
 * /api/songs/{id}:
 * get:
 * summary: Obtém música por ID
 * tags: [Songs]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Detalhes da música encontrados.
 * 404:
 * description: Música não localizada.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDatabase()
    const songList = await db.select().from(songs).where(eq(songs.id, parseInt(id)))

    if (songList.length === 0) {
      return res.status(404).json({ error: 'Música não encontrada' })
    }

    const cleanSong = Object.fromEntries(
      Object.entries(songList[0]).filter(([_, v]) => v !== null)
    )

    res.json(cleanSong)
  } catch (error) {
    console.error('Erro ao obter música:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

/**
 * @swagger
 * /api/songs:
 * post:
 * summary: Cria uma nova música
 * tags: [Songs]
 * responses:
 * 201:
 * description: Música criada com sucesso.
 */
router.post('/', async (req, res) => {
  try {
    const db = await getDatabase()
    const result = await db.insert(songs).values(req.body)
    res.status(201).json({ message: 'Música criada com sucesso!', result })
  } catch (error) {
    console.error('Erro ao criar música:', error)
    res.status(500).json({ error: 'Erro ao criar música' })
  }
})

/**
 * @swagger
 * /api/songs/{id}:
 * put:
 * summary: Atualiza uma música
 * tags: [Songs]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Música atualizada.
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDatabase()
    await db.update(songs).set(req.body).where(eq(songs.id, parseInt(id)))
    res.json({ message: 'Música atualizada com sucesso!' })
  } catch (error) {
    console.error('Erro ao atualizar música:', error)
    res.status(500).json({ error: 'Erro ao atualizar música' })
  }
})

/**
 * @swagger
 * /api/songs/{id}:
 * delete:
 * summary: Deleta uma música
 * tags: [Songs]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: Música removida.
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDatabase()
    await db.delete(songs).where(eq(songs.id, parseInt(id)))
    res.json({ message: 'Música deletada com sucesso!' })
  } catch (error) {
    console.error('Erro ao deletar música:', error)
    res.status(500).json({ error: 'Erro ao deletar música' })
  }
})

export default router