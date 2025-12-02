import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  mysqlEnum,
} from 'drizzle-orm/mysql-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './users';

export const transcriptions = mysqlTable('transcriptions', {
  id: varchar('id', { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  audioUrl: text('audio_url').notNull(),
  transcriptText: text('transcript_text'),
  language: varchar('language', { length: 10 }).notNull().default('en'),
  status: mysqlEnum('status', ['pending', 'processing', 'completed', 'failed'])
    .notNull()
    .default('pending'),
  duration: decimal('duration', { precision: 10, scale: 2 }),
  model: varchar('model', { length: 50 }),
  confidence: decimal('confidence', { precision: 5, scale: 4 }),
  errorMessage: text('error_message'),
  metadata: text('metadata'), // JSON stored as text
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const ttsRequests = mysqlTable('tts_requests', {
  id: varchar('id', { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  inputText: text('input_text').notNull(),
  audioUrl: text('audio_url'),
  voice: varchar('voice', { length: 50 }).notNull(),
  language: varchar('language', { length: 10 }).notNull().default('en'),
  status: mysqlEnum('status', ['pending', 'processing', 'completed', 'failed'])
    .notNull()
    .default('pending'),
  duration: decimal('duration', { precision: 10, scale: 2 }),
  model: varchar('model', { length: 50 }),
  errorMessage: text('error_message'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const llmConversations = mysqlTable('llm_conversations', {
  id: varchar('id', { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }),
  model: varchar('model', { length: 50 }).notNull(),
  systemPrompt: text('system_prompt'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const llmMessages = mysqlTable('llm_messages', {
  id: varchar('id', { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  conversationId: varchar('conversation_id', { length: 128 })
    .notNull()
    .references(() => llmConversations.id, { onDelete: 'cascade' }),
  role: mysqlEnum('role', ['user', 'assistant', 'system']).notNull(),
  content: text('content').notNull(),
  tokens: int('tokens'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
