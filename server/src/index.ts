import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { sql } from 'drizzle-orm'
import { initializeDatabase, getDatabase } from './db/config.js'
import usersRouter from './routes/users.js'
import songsRouter from './routes/songs.js'
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';


dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🎵 EngPurpose API',
      version: '1.0.0',
      description: 'Documentação interativa para praticar inglês através da música. Use os botões "Try it out" para testar os endpoints em tempo real!',
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Servidor Local de Desenvolvimento' }],
    tags: [{ name: 'Songs', description: 'Gerenciamento da biblioteca de músicas e níveis de dificuldade' }],
    paths: {
      '/api/songs': {
        get: {
          summary: 'Listar Biblioteca',
          description: 'Retorna todas as músicas cadastradas no banco para popular a listagem principal.',
          tags: ['Songs'],
          responses: {
            200: { description: 'Sucesso! Lista de músicas recuperada.' }
          }
        },
        post: {
          summary: 'Cadastrar Nova Música',
          description: 'Adiciona uma música ao catálogo. Requer título e artista obrigatórios.',
          tags: ['Songs'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', example: 'Flowers' },
                    artist: { type: 'string', example: 'Miley Cyrus' },
                    difficulty_level: { type: 'string', example: 'A2' },
                    duration: { type: 'integer', example: 200 },
                    youtube_url: { type: 'string', example: 'https://youtube.com/...' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Música criada com sucesso!' } }
        }
      },
      '/api/songs/{id}': {
        get: {
          summary: 'Detalhes da Música',
          description: 'Busca as informações completas (letras, descrição) de uma música específica pelo ID.',
          tags: ['Songs'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' }, example: 1 }],
          responses: { 200: { description: 'Música encontrada.' }, 404: { description: 'ID não localizado.' } }
        },
        put: {
          summary: 'Atualizar Dados',
          description: 'Edita campos de uma música existente. Ideal para ajustar o nível de dificuldade (A2, B1, B2).',
          tags: ['Songs'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SongUpdate' } } }
          },
          responses: { 200: { description: 'Atualização concluída.' } }
        },
        delete: {
          summary: 'Remover Música',
          description: 'Exclui permanentemente uma música da biblioteca.',
          tags: ['Songs'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Música removida com sucesso.' } }
        }
      }
    }
  },
  apis: [],
};

const specs = swaggerJsdoc(options);

app.get('/api-docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(specs);
});

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    swaggerOptions: {
      url: '/api-docs-json',
    }
  })
);

app.use(cors())
app.use(express.json())

//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor rodando!' })
})

app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando corretamente' })
})

app.get('/api/db-status', async (req, res) => {
  try {
    const db = await getDatabase()
    const result = await db.execute(sql`SELECT 1`)
    res.json({ status: 'connected', message: 'Banco de dados conectado com sucesso!' })
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error)
    res.status(500).json({ status: 'disconnected', message: 'Erro ao conectar com o banco de dados' })
  }
})

app.use('/api/users', usersRouter)
app.use('/api/songs', songsRouter)

async function start() {
  try {
    await initializeDatabase()
    console.log('✅ Banco de dados conectado!')

    app.listen(PORT, () => {
      console.log(`✅ Servidor rodando em http://localhost:${PORT}`)
      console.log(`📝 Ambiente: ${process.env.NODE_ENV}`)
      console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`) // Log adicionado para facilitar seu acesso
      console.log(`\n📚 Rotas disponíveis:`)
      console.log(`  POST   /api/users/signup - Criar novo usuário`)
      console.log(`  POST   /api/users/login - Fazer login`)
      console.log(`  GET    /api/users - Listar usuários`)
      console.log(`  GET    /api/users/:id - Obter usuário`)
      console.log(`  GET    /api/songs - Listar músicas`)
      console.log(`  GET    /api/songs/:id - Obter música`)
      console.log(`  POST   /api/songs - Criar música`)
      console.log(`  PUT    /api/songs/:id - Atualizar música`)
      console.log(`  DELETE /api/songs/:id - Deletar música`)
    })
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error)
    process.exit(1)
  }
}

start()