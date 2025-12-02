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

export const pipelines = mysqlTable('pipelines', {
  id: varchar('id', { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  config: text('config').notNull(), // JSON configuration
  status: mysqlEnum('status', ['active', 'inactive', 'archived'])
    .notNull()
    .default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const pipelineExecutions = mysqlTable('pipeline_executions', {
  id: varchar('id', { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  pipelineId: varchar('pipeline_id', { length: 128 })
    .notNull()
    .references(() => pipelines.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 128 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: mysqlEnum('status', ['pending', 'running', 'completed', 'failed', 'cancelled'])
    .notNull()
    .default('pending'),
  inputData: text('input_data'),
  outputData: text('output_data'),
  errorMessage: text('error_message'),
  executionTime: int('execution_time'), // in milliseconds
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const apiKeys = mysqlTable('api_keys', {
  id: varchar('id', { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const usageMetrics = mysqlTable('usage_metrics', {
  id: varchar('id', { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar('user_id', { length: 128 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  service: mysqlEnum('service', ['asr', 'tts', 'llm', 'pipeline']).notNull(),
  requestCount: int('request_count').notNull().default(0),
  tokenCount: int('token_count').default(0),
  cost: decimal('cost', { precision: 10, scale: 4 }).default('0'),
  date: timestamp('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
