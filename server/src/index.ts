import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { sql } from 'drizzle-orm'
import { initializeDatabase, getDatabase } from './db/config.js'
import usersRouter from './routes/users.js'
import songsRouter from './routes/songs.js'
import aiRouter from './routes/ai.js'
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🎵 EngPurpose API',
      version: '1.0.0',
      description: 'Documentação interativa gerada automaticamente. Use para testar os endpoints de Músicas, Usuários e IA Tutor.',
    },
    servers: [
      { 
        url: `http://localhost:${PORT}`, 
        description: 'Servidor Local de Desenvolvimento' 
      }
    ],
    // Organização das categorias no Swagger UI
    tags: [
      { name: 'Songs', description: 'Gerenciamento da biblioteca de músicas' },
      { name: 'Users', description: 'Autenticação e perfis de usuário' },
      { name: 'AI Tutor', description: 'Interação com a Inteligência Artificial' }
    ],
  },
  // O SEGREDO: Ele vai ler os comentários /** @swagger */ em todos os arquivos da pasta routes
  // Incluímos caminhos comuns para garantir que funcione em Dev (ts) e Build (js)
  apis: [
    './src/routes/*.ts', 
    './routes/*.ts', 
    './dist/routes/*.js', 
    './routes/*.js'
  ], 
};

const specs = swaggerJsdoc(swaggerOptions);

// 3. ROTAS DE DOCUMENTAÇÃO
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(specs);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// 4. DEFINIÇÃO DAS ROTAS DA API
app.use('/api/users', usersRouter)
app.use('/api/songs', songsRouter)
app.use('/api/ai', aiRouter)

// 5. ENDPOINTS DE UTILIDADE (Health Check & DB)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor rodando perfeitamente!' })
})

app.get('/api/db-status', async (req, res) => {
  try {
    const db = await getDatabase()
    await db.execute(sql`SELECT 1`)
    res.json({ status: 'connected', message: 'Banco de dados operacional!' })
  } catch (error) {
    console.error('Erro de conexão DB:', error)
    res.status(500).json({ status: 'disconnected', error: 'Falha na conexão com o banco' })
  }
})

// 6. INICIALIZAÇÃO DO SERVIDOR
async function start() {
  try {
    // Garante que o banco está pronto antes de subir a API
    await initializeDatabase()
    console.log('✅ Banco de dados conectado com sucesso!')

    app.listen(PORT, () => {
      console.log(`\n🚀 SERVIDOR ONLINE: http://localhost:${PORT}`)
      console.log(`📚 DOCUMENTAÇÃO SWAGGER: http://localhost:${PORT}/api-docs`)
      console.log(`\n--- Rotas Ativas ---`)
      console.log(`[AUTH] /api/users`)
      console.log(`[SONG] /api/songs`)
      console.log(`[ AI ] /api/ai`)
    })
  } catch (error) {
    console.error('❌ Erro fatal na inicialização:', error)
    process.exit(1)
  }
}

start()