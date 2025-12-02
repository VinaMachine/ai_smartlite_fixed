# Development Setup Guide

Set up your local development environment for contributing to AI_SMARTLITE.

## Prerequisites

### Required Software

- **Git**: Version control
- **Node.js**: v20.x or later (for Gateway)
- **Python**: 3.11 or later (for services)
- **Docker**: 24.0+ (for local infrastructure)
- **IDE**: VS Code recommended

### Optional Tools

- **Postman/Insomnia**: API testing
- **DBeaver/MySQL Workbench**: Database management
- **Redis Commander**: Redis GUI

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/VinaChat/AI_SMARTLITE.git
cd AI_SMARTLITE
```

### 2. Install Dependencies

**Gateway (Node.js):**

```bash
cd apps/gateway
npm install
```

**Python Services:**

```bash
# ASR Service
cd services/asr-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Repeat for other services
cd ../tts-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Schemas:**

```bash
cd schemas
npm install
```

### 3. Setup Environment

Create `.env` files for each service:

**Gateway (.env):**
```bash
NODE_ENV=development
PORT=8080

DB_HOST=localhost
DB_PORT=3306
DB_NAME=ai_smartlite
DB_USER=smartlite_user
DB_PASSWORD=SecurePassword123!

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-dev-jwt-secret
JWT_EXPIRES_IN=24h

ASR_SERVICE_URL=http://localhost:8001
TTS_SERVICE_URL=http://localhost:8002
LLM_SERVICE_URL=http://localhost:8003
PIPELINE_SERVICE_URL=http://localhost:8004
```

**Python Services (.env):**
```bash
PYTHON_ENV=development
LOG_LEVEL=DEBUG

DB_HOST=localhost
DB_PORT=3306
DB_NAME=ai_smartlite
DB_USER=smartlite_user
DB_PASSWORD=SecurePassword123!

REDIS_HOST=localhost
REDIS_PORT=6379

# Service-specific
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
```

### 4. Start Infrastructure

**Start database and cache:**

```bash
cd AI_SMARTLITE
docker-compose -f docker-compose.dev.yml up -d
```

This starts:
- MySQL on port 3306
- Redis on port 6379

### 5. Run Database Migrations

```bash
cd schemas
npm run migrate
```

### 6. Start Services

**Terminal 1 - Gateway:**
```bash
cd apps/gateway
npm run dev
```

**Terminal 2 - ASR Service:**
```bash
cd services/asr-service
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 3 - TTS Service:**
```bash
cd services/tts-service
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

**Terminal 4 - LLM Service:**
```bash
cd services/llm-service
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8003 --reload
```

**Terminal 5 - Pipeline Service:**
```bash
cd services/pipeline-service
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8004 --reload
```

### 7. Verify Setup

```bash
# Check Gateway
curl http://localhost:8080/health

# Check ASR Service
curl http://localhost:8001/health

# Check TTS Service
curl http://localhost:8002/health

# Check LLM Service
curl http://localhost:8003/health

# Check Pipeline Service
curl http://localhost:8004/health
```

## IDE Configuration

### VS Code

**Recommended Extensions:**

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "ms-python.black-formatter",
    "ms-azuretools.vscode-docker",
    "humao.rest-client",
    "prisma.prisma"
  ]
}
```

**Settings (.vscode/settings.json):**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.organizeImports": true
    }
  },
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.linting.mypyEnabled": true,
  "python.testing.pytestEnabled": true,
  "eslint.validate": ["javascript", "typescript"],
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

**Launch Configuration (.vscode/launch.json):**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Gateway",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/apps/gateway",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug ASR Service",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["main:app", "--reload", "--port", "8001"],
      "cwd": "${workspaceFolder}/services/asr-service",
      "env": {
        "PYTHONPATH": "${workspaceFolder}/services/asr-service"
      }
    }
  ]
}
```

## Project Structure

```
AI_SMARTLITE/
├── apps/
│   ├── gateway/          # API Gateway (Node.js)
│   ├── web/              # Web UI (Next.js)
│   └── desktop/          # Desktop app (Electron)
├── services/
│   ├── asr-service/      # Speech-to-Text
│   ├── tts-service/      # Text-to-Speech
│   ├── llm-service/      # LLM Integration
│   └── pipeline-service/ # Workflow Orchestration
├── schemas/              # Database schemas (Drizzle ORM)
├── infra/
│   └── docker/           # Docker configurations
├── tests/                # Integration & E2E tests
├── ci/                   # CI/CD scripts & configs
├── docs/                 # Documentation
├── docker-compose.yml    # Production compose
├── docker-compose.dev.yml # Development compose
└── README.md
```

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Follow coding standards (see below).

### 3. Run Tests

```bash
# Unit tests
cd apps/gateway
npm test

# Python tests
cd services/asr-service
pytest

# Integration tests
cd tests
npm test

# E2E tests
npm run test:e2e
```

### 4. Lint Code

```bash
# JavaScript/TypeScript
cd apps/gateway
npm run lint
npm run format

# Python
cd services/asr-service
flake8 .
black .
mypy .
```

### 5. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
```

**Commit message format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Create Pull Request on GitHub.

## Coding Standards

### TypeScript (Gateway)

**ESLint Configuration:**

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "no-console": "warn"
  }
}
```

**Example:**

```typescript
// ✅ Good
export async function transcribeAudio(
  audioFile: Express.Multer.File
): Promise<TranscriptionResult> {
  const result = await asrService.transcribe(audioFile);
  return result;
}

// ❌ Bad
export async function transcribeAudio(audioFile: any) {
  const result = await asrService.transcribe(audioFile);
  return result;
}
```

### Python (Services)

**Configuration (.flake8):**

```ini
[flake8]
max-line-length = 100
exclude = .git,__pycache__,venv
ignore = E203,W503
```

**Example:**

```python
# ✅ Good
from typing import Optional
from fastapi import FastAPI, UploadFile, HTTPException

async def transcribe_audio(
    audio_file: UploadFile,
    language: Optional[str] = "en"
) -> dict:
    """
    Transcribe audio file to text.
    
    Args:
        audio_file: Audio file to transcribe
        language: Language code (default: en)
        
    Returns:
        Transcription result dictionary
    """
    if not audio_file:
        raise HTTPException(status_code=400, detail="No audio file provided")
    
    result = await process_audio(audio_file, language)
    return result

# ❌ Bad
async def transcribe_audio(audio_file, language="en"):
    result = await process_audio(audio_file, language)
    return result
```

### Code Style

**Naming Conventions:**
- Variables: `camelCase` (JS/TS), `snake_case` (Python)
- Functions: `camelCase` (JS/TS), `snake_case` (Python)
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private: `_prefixed` (Python)

**File Naming:**
- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Python modules: `snake_case.py`

## Testing

### Unit Tests

**JavaScript/TypeScript (Jest):**

```typescript
import { transcribeAudio } from './transcription';

describe('transcribeAudio', () => {
  it('should transcribe audio file', async () => {
    const mockFile = {
      buffer: Buffer.from('audio data'),
      mimetype: 'audio/mp3'
    };
    
    const result = await transcribeAudio(mockFile);
    
    expect(result).toHaveProperty('text');
    expect(result.text).toBeTruthy();
  });
});
```

**Python (Pytest):**

```python
import pytest
from main import transcribe_audio

@pytest.mark.asyncio
async def test_transcribe_audio():
    audio_file = MockUploadFile(content=b"audio data")
    
    result = await transcribe_audio(audio_file, language="en")
    
    assert "text" in result
    assert len(result["text"]) > 0
```

### Integration Tests

```typescript
import { setupTestEnvironment, teardownTestEnvironment } from './test-utils';

describe('ASR Integration', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  it('should transcribe audio end-to-end', async () => {
    const response = await fetch('http://localhost:8080/api/asr/transcribe', {
      method: 'POST',
      body: formData
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

## Debugging

### Node.js Debugging

```bash
# Start with debugger
cd apps/gateway
npm run debug

# VS Code: Press F5 to attach debugger
```

### Python Debugging

```python
# Add breakpoint
import pdb; pdb.set_trace()

# Or use debugpy
import debugpy
debugpy.listen(5678)
debugpy.wait_for_client()
```

### Docker Debugging

```bash
# Attach to running container
docker exec -it gateway bash

# View live logs
docker logs -f gateway

# Inspect container
docker inspect gateway
```

## Database Management

### Migrations

```bash
# Generate migration
cd schemas
npm run generate

# Run migrations
npm run migrate

# Rollback
npm run rollback
```

### Seed Data

```bash
cd schemas
npm run seed
```

### Database Console

```bash
# MySQL
docker exec -it mysql mysql -u smartlite_user -p ai_smartlite

# Or use GUI tool
# DBeaver: localhost:3306
```

## Common Issues

### Port Already in Use

```bash
# Find process using port
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Python Virtual Environment

```bash
# Recreate venv
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Node Modules Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Database Connection

```bash
# Reset database
docker-compose down -v
docker-compose up -d mysql redis
cd schemas && npm run migrate
```

## Resources

- [Architecture Documentation](../architecture/overview.md)
- [API Documentation](../api/)
- [Testing Guide](./testing.md)
- [CI/CD Guide](./ci-cd.md)
- [Contributing Guidelines](./contributing.md)

## Getting Help

- **Discord**: [Join community](https://discord.gg/ai-smartlite)
- **GitHub Issues**: [Report bugs](https://github.com/VinaChat/AI_SMARTLITE/issues)
- **Email**: dev@ai-smartlite.com
