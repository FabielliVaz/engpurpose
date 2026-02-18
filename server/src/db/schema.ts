import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  boolean,
  decimal,
  datetime,
  json,
  mysqlEnum,
  serial,
} from 'drizzle-orm/mysql-core'

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  profileImage: varchar('profile_image', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

export const songs = mysqlTable('songs', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  artist: varchar('artist', { length: 255 }).notNull(),
  difficultyLevel: mysqlEnum('difficulty_level', ['A2', 'B1', 'B2']).notNull(),
  lyrics: text('lyrics').notNull(),
  translation: text('translation').notNull(),
  themes: json('themes'),
  coverUrl: varchar('cover_url', { length: 500 }),
  playerUrl: varchar('player_url', { length: 500 }),
  youtubeUrl: varchar('youtube_url', { length: 500 }),
  description: text('description'),
  duration: int('duration'),
  lyricsTimestamps: text('lyrics_timestamps'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

export const quizzes = mysqlTable('quizzes', {
  id: serial('id').primaryKey(),
  songId: int('song_id').notNull(),
  question: text('question').notNull(),
  options: json('options').notNull(),
  correctAnswer: varchar('correct_answer', { length: 255 }).notNull(),
  explanation: text('explanation'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const userProgress = mysqlTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  songId: int('song_id').notNull(),
  quizzesPassed: int('quizzes_passed').default(0),
  score: decimal('score', { precision: 5, scale: 2 }).default('0'),
  completedAt: datetime('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})

export const quizHistory = mysqlTable('quiz_history', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  quizId: int('quiz_id').notNull(),
  userAnswer: varchar('user_answer', { length: 255 }).notNull(),
  isCorrect: boolean('is_correct').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const favorites = mysqlTable('favorites', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  songId: int('song_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})
