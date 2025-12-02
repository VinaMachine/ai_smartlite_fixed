# Database Schemas

Shared database schemas using Drizzle ORM and MySQL2 for the AI_SMARTLITE platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Generate migrations:
```bash
npm run generate
```

4. Run migrations:
```bash
npm run migrate
```

## Database Structure

### Users & Authentication
- **users** - User accounts
- **sessions** - Active user sessions
- **refresh_tokens** - Refresh tokens for authentication
- **api_keys** - API keys for programmatic access

### Services
- **transcriptions** - ASR (Automatic Speech Recognition) records
- **tts_requests** - Text-to-Speech requests
- **llm_conversations** - LLM conversation threads
- **llm_messages** - Individual messages in conversations

### Pipeline & Analytics
- **pipelines** - Pipeline configurations
- **pipeline_executions** - Pipeline execution history
- **usage_metrics** - Service usage tracking and billing

## Scripts

- `npm run build` - Compile TypeScript
- `npm run generate` - Generate SQL migrations from schema
- `npm run migrate` - Run migrations
- `npm run push` - Push schema changes directly (dev only)
- `npm run studio` - Open Drizzle Studio UI

## Usage in Services

```typescript
import { db, schema } from '@ai-smartlite/schemas';

// Query users
const users = await db.select().from(schema.users);

// Insert transcription
await db.insert(schema.transcriptions).values({
  userId: 'user_123',
  audioUrl: 'https://...',
  language: 'en',
});
```

## Type Safety

```typescript
import type { InferSelectModel, InferInsertModel } from '@ai-smartlite/schemas';
import { users } from '@ai-smartlite/schemas';

type User = InferSelectModel<typeof users>;
type NewUser = InferInsertModel<typeof users>;
```
