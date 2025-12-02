# Tests

Comprehensive testing suite for AI_SMARTLITE microservices platform.

## Setup

1. Install dependencies:
```bash
cd tests
npm install
```

2. Configure environment:
```bash
cp .env.test.example .env.test
# Edit .env.test with your test environment settings
```

3. Start test services:
```bash
# From project root
docker-compose -f docker-compose.dev.yml up -d
```

## Test Types

### 🔧 Integration Tests
Test individual services with their dependencies (database, Redis).

```bash
npm run test:integration
```

**Coverage:**
- ASR Service API endpoints
- TTS Service API endpoints  
- LLM Service conversations & messages
- Pipeline Service execution
- Gateway routing

### 🌐 E2E Tests
Test complete user workflows across multiple services.

```bash
npm run test:e2e
```

**Scenarios:**
- Voice assistant flow (ASR → LLM → TTS)
- Automated pipeline execution
- Complete user journey

### 📊 Load Tests
Performance testing with k6.

```bash
npm run test:load
```

**Tests:**
- ASR service load
- TTS service load
- LLM service load
- Gateway load

### 📝 Contract Tests
Validate API contracts and schemas.

```bash
npm run test:contract
```

**Validates:**
- Request/response schemas
- Required/optional fields
- Status codes
- Error messages

## Running Tests

**All tests:**
```bash
npm test
```

**Watch mode:**
```bash
npm run test:watch
```

**With coverage:**
```bash
npm run test:coverage
```

**Specific test file:**
```bash
npm test -- integration/asr-service/transcription.test.ts
```

## Test Structure

```
tests/
├── integration/          # Service integration tests
│   ├── asr-service/
│   ├── tts-service/
│   ├── llm-service/
│   ├── pipeline-service/
│   └── gateway/
├── e2e/                 # End-to-end tests
│   ├── scenarios/
│   └── fixtures/
├── load/                # Load tests (k6)
│   └── scenarios/
├── contract/            # API contract tests
└── shared/              # Shared utilities
    ├── client.ts        # HTTP clients
    ├── config.ts        # Test configuration
    ├── database.ts      # DB helpers
    ├── fixtures.ts      # Test data generators
    └── setup.ts         # Test setup
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Push to main branch
- Scheduled runs (nightly)

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data
3. **Assertions**: Use specific assertions
4. **Timeouts**: Set appropriate timeouts
5. **Fixtures**: Use fixtures for test data

## Debugging

**Run with verbose output:**
```bash
npm test -- --verbose
```

**Run single test:**
```bash
npm test -- -t "should create transcription request"
```

**Debug in VS Code:**
Add breakpoint and use "Jest: Debug" configuration

## Troubleshooting

**Database connection failed:**
- Ensure MySQL is running: `docker-compose -f docker-compose.dev.yml ps`
- Check credentials in `.env.test`

**Service not responding:**
- Verify services are running
- Check service health endpoints
- Review service logs

**Timeout errors:**
- Increase `TEST_TIMEOUT` in `.env.test`
- Check service performance
