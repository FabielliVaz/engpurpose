import { drizzle } from 'drizzle-orm/mysql2/driver'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

let db: any = null

export async function initializeDatabase() {
  if (db) return db
  
  const poolConnection = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })

  db = drizzle(poolConnection)
  return db
}

export async function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.')
  }
  return db
}
