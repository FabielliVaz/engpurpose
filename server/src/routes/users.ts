import express, { Router } from 'express';
import { eq } from 'drizzle-orm'
import * as bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDatabase } from '../db/config'
import { users } from '../db/schema.js'

const router: Router = Router()

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Cadastra um novo usuário
 *     description: Cria um novo perfil no sistema com senha criptografada.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Fabi QA
 *               email:
 *                 type: string
 *                 example: fabi@example.com
 *               password:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso.
 *       400:
 *         description: Email já cadastrado ou dados inválidos.
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
    }

    const db = await getDatabase()

    const existingUser = await db.select().from(users).where(eq(users.email, email))
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' })
    }

    const hashedPassword = await bcryptjs.hash(password, 10)

    const result = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    })

    const newUserList = await db.select({ id: users.id }).from(users).where(eq(users.email, email))
    const userId = newUserList[0]?.id

    return res.status(201).json({ 
      message: 'Usuário criado com sucesso!',
      userId 
    })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Realiza login do usuário
 *     description: Autentica o usuário e retorna um token JWT válido por 15 minutos.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: fabi@example.com
 *               password:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso.
 *       401:
 *         description: Email ou senha inválidos.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    const db = await getDatabase()

    const userList = await db.select().from(users).where(eq(users.email, email))
    if (userList.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' })
    }

    const user = userList[0]

    const isPasswordValid = await bcryptjs.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou senha inválidos' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '15m' }
    )

    return res.json({ 
      message: 'Login realizado com sucesso!',
      token,
      expiresIn: 900, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    })
  } catch (error) {
    console.error('Erro ao fazer login:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

/**
 * @swagger
 * /api/users:
 *    get:
 *      summary: Lista todos os usuários
 *      description: Retorna IDs, nomes e emails de todos os usuários cadastrados.
 *      tags: [Users]
 *    responses:
 *      200:
 *        description: Lista de usuários recuperada com sucesso.
 */
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase()
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    }).from(users)
    
    res.json(allUsers)
  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtém dados de um usuário específico
 *     description: Retorna informações públicas de um usuário através do seu ID.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário encontrado com sucesso.
 *       404:
 *         description: Usuário não encontrado.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDatabase()
    
    const userList = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, parseInt(id)))
    
    if (userList.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }
    
    res.json(userList[0])
  } catch (error) {
    console.error('Erro ao obter usuário:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router