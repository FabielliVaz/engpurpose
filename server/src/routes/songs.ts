import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { getDatabase } from '../db/config'
import { songs } from '../db/schema.js'

const router: Router = Router()

/**
 * @swagger
 * /api/songs:
 *   get:
 *     summary: Lista todas as músicas
 *     tags: [Songs]
 *     responses:
 *       200:
 *         description: Lista recuperada com sucesso.
 *   post:
 *     summary: Cadastra uma nova música completa
 *     description: Cria um registro com letra, tradução e links de mídia.
 *     tags: [Songs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - artist
 *               - difficultyLevel
 *               - lyrics
 *               - translation
 *               - youtubeUrl
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Flowers"
 *               artist:
 *                 type: string
 *                 example: "Miley Cyrus"
 *               difficultyLevel:
 *                 type: string
 *                 enum: [A2, B1, B2]
 *                 example: "A2"
 *               lyrics:
 *                 type: string
 *                 example: "We were good, we were gold..."
 *               translation:
 *                 type: string
 *                 example: "Nós estávamos bem, éramos dourados..."
 *               youtubeUrl:
 *                 type: string
 *                 example: "https://www.youtube.com/watch?v=gvf8"
 *     responses:
 *       201:
 *         description: Música criada com sucesso!
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
 *   get:
 *     summary: Obtém música por ID
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sucesso.
 *       404:
 *         description: Não encontrado.
 *   put:
 *     summary: Atualizar Dados
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               artist:
 *                 type: string
 *               difficulty_level:
 *                 type: string
 *               lyrics:
 *                 type: string
 *               translation:
 *                 type: string
 *               youtube_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Atualização concluída.
 *   delete:
 *     summary: Deleta uma música
 *     tags: [Songs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Música removida.
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

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDatabase()
    await db.update(songs).set(req.body).where(eq(songs.id, parseInt(id)))
    res.json({ message: 'Música atualizada com sucesso!' })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar música' })
  }
})

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