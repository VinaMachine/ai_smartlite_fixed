# Database Schema

AI_SMARTLITE uses MySQL 8.0 as the primary database with Drizzle ORM for type-safe database operations.

## Schema Overview

The database is organized into three main domains:
1. **User Management** - Authentication and user data
2. **Service Records** - ASR, TTS, and LLM operations
3. **Pipeline Management** - Workflow orchestration

## Entity Relationship Diagram

```
┌──────────────┐     1:N     ┌───────────────────┐
│    users     │─────────────│    sessions       │
└──────┬───────┘             └───────────────────┘
       │ 1:N                 
       ├─────────────────────┬─────────────────┬──────────────────┐
       │                     │                 │                  │
       ▼                     ▼                 ▼                  ▼
┌──────────────┐     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│transcriptions│     │ tts_requests │  │llm_conversations│ │  pipelines   │
└──────────────┘     └──────────────┘  └──────┬───────┘  └──────┬───────┘
                                               │ 1:N             │ 1:N
                                               ▼                 ▼
                                        ┌──────────────┐  ┌──────────────┐
                                        │llm_messages  │  │pipeline_exec │
                                        └──────────────┘  └──────────────┘
```

## Tables

### Users & Authentication

#### `users`
User account information.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(128) PK | Unique user identifier (CUID2) |
| email | VARCHAR(255) UNIQUE | User email address |
| username | VARCHAR(100) UNIQUE | Username |
| password_hash | VARCHAR(255) | Hashed password |
| first_name | VARCHAR(100) | First name |
| last_name | VARCHAR(100) | Last name |
| avatar | TEXT | Avatar URL |
| is_active | BOOLEAN | Account active status |
| is_verified | BOOLEAN | Email verification status |
| last_login_at | TIMESTAMP | Last login timestamp |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (email)
- UNIQUE INDEX (username)

#### `sessions`
Active user sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(128) PK | Session identifier |
| user_id | VARCHAR(128) FK | References users(id) |
| token | VARCHAR(500) UNIQUE | Session token |
| ip_address | VARCHAR(45) | Client IP address |
| user_agent | TEXT | Client user agent |
| expires_at | TIMESTAMP | Session expiration |
| created_at | TIMESTAMP | Session creation time |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (user_id) → users(id) ON DELETE CASCADE
- UNIQUE INDEX (token)
- INDEX (expires_at)

#### `refresh_tokens`
Refresh tokens for authentication.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(128) PK | Token identifier |
| user_id | VARCHAR(128) FK | References users(id) |
| token | VARCHAR(500) UNIQUE | Refresh token |
| expires_at | TIMESTAMP | Token expiration |
| created_at | TIMESTAMP | Creation time |

### ASR Service

#### `transcriptions`
Speech-to-text transcription records.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(128) PK | Transcription identifier |
| user_id | VARCHAR(128) FK | References users(id) |
| audio_url | TEXT | Audio file URL |
| transcript_text | TEXT | Transcribed text result |
| language | VARCHAR(10) | Language code (en, es, etc) |
| status | ENUM | pending, processing, completed, failed |
| duration | DECIMAL(10,2) | Audio duration in seconds |
| model | VARCHAR(50) | Model used for transcription |
| confidence | DECIMAL(5,4) | Confidence score (0-1) |
| error_message | TEXT | Error details if failed |
| metadata | TEXT (JSON) | Additional metadata |
| created_at | TIMESTAMP | Request creation time |
| updated_at | TIMESTAMP | Last update time |
| completed_at | TIMESTAMP | Completion timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (user_id) → users(id) ON DELETE CASCADE
- INDEX (status, created_at)
- INDEX (user_id, created_at)

### TTS Service

#### `tts_requests`
Text-to-speech synthesis requests.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(128) PK | Request identifier |
| user_id | VARCHAR(128) FK | References users(id) |
| input_text | TEXT | Text to synthesize |
| audio_url | TEXT | Generated audio URL |
| voice | VARCHAR(50) | Voice identifier |
| language | VARCHAR(10) | Language code |
| status | ENUM | pending, processing, completed, failed |
| duration | DECIMAL(10,2) | Audio duration in seconds |
| model | VARCHAR(50) | TTS model used |
| error_message | TEXT | Error details if failed |
| metadata | TEXT (JSON) | Additional metadata |
| created_at | TIMESTAMP | Request creation time |
| updated_at | TIMESTAMP | Last update time |
| completed_at | TIMESTAMP | Completion timestamp |

### LLM Service

#### `llm_conversations`
LLM conversation threads.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(128) PK | Conversation identifier |
| user_id | VARCHAR(128) FK | References users(id) |
| title | VARCHAR(255) | Conversation title |
| model | VARCHAR(50) | LLM model (gpt-3.5-turbo, etc) |
| system_prompt | TEXT | System prompt/instructions |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

#### `llm_messages`
Individual messages in conversations.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(128) PK | Message identifier |
| conversation_id | VARCHAR(128) FK | References llm_conversations(id) |
| role | ENUM | user, assistant, system |
| content | TEXT | Message content |
| tokens | INT | Token count |
| metadata | TEXT (JSON) | Additional metadata |
| created_at | TIMESTAMP | Message timestamp |

### Pipeline Service

#### `pipelines`
Pipeline configurations.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(128) PK | Pipeline identifier |
| user_id | VARCHAR(128) FK | References users(id) |
| name | VARCHAR(255) | Pipeline name |
| description | TEXT | Pipeline description |
| config | TEXT (JSON) | Pipeline configuration |
| status | ENUM | active, inactive, archived |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

#### `pipeline_executions`
Pipeline execution history.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(128) PK | Execution identifier |
| pipeline_id | VARCHAR(128) FK | References pipelines(id) |
| user_id | VARCHAR(128) FK | References users(id) |
| status | ENUM | pending, running, completed, failed, cancelled |
| input_data | TEXT (JSON) | Input data |
| output_data | TEXT (JSON) | Output results |
| error_message | TEXT | Error details if failed |
| execution_time | INT | Duration in milliseconds |
| created_at | TIMESTAMP | Start time |
| updated_at | TIMESTAMP | Last update time |
| completed_at | TIMESTAMP | Completion time |

### API & Metrics

#### `api_keys`
User API keys for programmatic access.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(128) PK | Key identifier |
| user_id | VARCHAR(128) FK | References users(id) |
| name | VARCHAR(255) | Key name/description |
| key | VARCHAR(255) UNIQUE | API key value |
| last_used_at | TIMESTAMP | Last usage timestamp |
| expires_at | TIMESTAMP | Expiration timestamp |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

#### `usage_metrics`
Service usage tracking and billing.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(128) PK | Metric identifier |
| user_id | VARCHAR(128) FK | References users(id) |
| service | ENUM | asr, tts, llm, pipeline |
| request_count | INT | Number of requests |
| token_count | INT | Total tokens used (LLM) |
| cost | DECIMAL(10,4) | Calculated cost |
| date | TIMESTAMP | Metric date |
| created_at | TIMESTAMP | Record creation time |

## Migrations

Database migrations are managed with Drizzle Kit:

```bash
# Generate migrations
cd schemas
npm run generate

# Run migrations
npm run migrate

# Push schema directly (dev only)
npm run push
```

## Connection Configuration

```typescript
// Database connection
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};
```

## Best Practices

1. **Use Transactions**: For multi-table operations
2. **Indexes**: Add indexes for frequently queried columns
3. **Soft Deletes**: Consider soft deletes for important data
4. **Backups**: Regular automated backups
5. **Connection Pooling**: Use connection pools for efficiency
6. **Query Optimization**: Monitor and optimize slow queries
7. **Data Retention**: Implement data retention policies

## Performance Tuning

- Enable query cache
- Optimize JOIN operations
- Use covering indexes
- Partition large tables
- Regular ANALYZE TABLE
- Monitor slow query log
