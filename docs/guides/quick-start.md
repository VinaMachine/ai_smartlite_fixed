# Quick Start Guide

Get started with AI_SMARTLITE in minutes. This guide will help you set up and make your first API calls.

## Prerequisites

- Docker and Docker Compose installed
- Basic understanding of REST APIs
- Terminal/Command Prompt access

## 1. Installation

### Clone Repository

```bash
git clone https://github.com/VinaChat/AI_SMARTLITE.git
cd AI_SMARTLITE
```

### Start Services

**Using Docker Compose:**

```bash
# Start all services
docker-compose up -d

# Check service health
docker-compose ps
```

**Expected output:**
```
NAME                STATUS              PORTS
gateway             Up (healthy)        0.0.0.0:8080->8080/tcp
asr-service         Up (healthy)        0.0.0.0:8001->8000/tcp
tts-service         Up (healthy)        0.0.0.0:8002->8000/tcp
llm-service         Up (healthy)        0.0.0.0:8003->8000/tcp
pipeline-service    Up (healthy)        0.0.0.0:8004->8000/tcp
mysql               Up                  0.0.0.0:3306->3306/tcp
redis               Up                  0.0.0.0:6379->6379/tcp
```

Services will be available at:
- **API Gateway**: http://localhost:8080
- **ASR Service**: http://localhost:8001
- **TTS Service**: http://localhost:8002
- **LLM Service**: http://localhost:8003
- **Pipeline Service**: http://localhost:8004

## 2. Create Account

### Register New User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "demo_user",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cm1abc123xyz",
      "email": "user@example.com",
      "username": "demo_user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Save the `accessToken` - you'll need it for subsequent requests.

### Set Token Variable

```bash
# Linux/Mac
export TOKEN="your_access_token_here"

# Windows PowerShell
$TOKEN = "your_access_token_here"

# Windows CMD
set TOKEN=your_access_token_here
```

## 3. Your First API Calls

### Speech-to-Text (ASR)

Transcribe an audio file:

```bash
curl -X POST http://localhost:8080/api/asr/transcribe \
  -H "Authorization: Bearer $TOKEN" \
  -F "audio=@your_audio.mp3" \
  -F "language=en"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cm1trans123xyz",
    "status": "processing"
  }
}
```

Check transcription status:

```bash
curl http://localhost:8080/api/asr/transcriptions/cm1trans123xyz \
  -H "Authorization: Bearer $TOKEN"
```

### Text-to-Speech (TTS)

Convert text to speech:

```bash
curl -X POST http://localhost:8080/api/tts/synthesize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, welcome to AI SmartLite!",
    "voice": "en-US-Neural2-A",
    "format": "mp3"
  }'
```

Download generated audio:

```bash
curl http://localhost:8080/api/tts/requests/{request_id}/audio \
  -H "Authorization: Bearer $TOKEN" \
  -o output.mp3
```

### Chat with LLM

Start a conversation:

```bash
# Create conversation
CONV_ID=$(curl -X POST http://localhost:8080/api/llm/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Chat",
    "model": "gpt-3.5-turbo"
  }' | jq -r '.data.id')

# Send message
curl -X POST http://localhost:8080/api/llm/conversations/$CONV_ID/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "What is AI?"
  }'
```

### Voice Assistant Pipeline

Execute a complete voice-to-voice workflow:

```bash
# Create pipeline
PIPELINE_ID=$(curl -X POST http://localhost:8080/api/pipelines \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Voice Assistant",
    "config": {
      "steps": [
        {
          "id": "transcribe",
          "service": "asr",
          "action": "transcribe"
        },
        {
          "id": "respond",
          "service": "llm",
          "action": "completion",
          "input": {"prompt": "{{transcribe.transcript}}"}
        },
        {
          "id": "speak",
          "service": "tts",
          "action": "synthesize",
          "input": {"text": "{{respond.content}}"}
        }
      ]
    }
  }' | jq -r '.data.id')

# Execute pipeline
curl -X POST http://localhost:8080/api/pipelines/$PIPELINE_ID/execute \
  -H "Authorization: Bearer $TOKEN" \
  -F "audio=@question.mp3"
```

## 4. Using SDKs

### JavaScript/TypeScript

```bash
npm install @ai-smartlite/sdk
```

```javascript
import { AISmartLite } from '@ai-smartlite/sdk';

const client = new AISmartLite({
  apiKey: 'your_api_key_here',
  baseURL: 'http://localhost:8080/api'
});

// Transcribe audio
const transcription = await client.asr.transcribe({
  audioFile: './recording.mp3',
  language: 'en'
});

console.log(transcription.text);

// Text-to-speech
const audio = await client.tts.synthesize({
  text: 'Hello world',
  voice: 'en-US-Neural2-A'
});

await audio.save('output.mp3');

// Chat
const conversation = await client.llm.createConversation({
  model: 'gpt-3.5-turbo'
});

const response = await conversation.sendMessage('Hello!');
console.log(response.content);
```

### Python

```bash
pip install ai-smartlite
```

```python
from ai_smartlite import AISmartLite

client = AISmartLite(
    api_key="your_api_key_here",
    base_url="http://localhost:8080/api"
)

# Transcribe audio
transcription = client.asr.transcribe(
    audio_file="recording.mp3",
    language="en"
)
print(transcription.text)

# Text-to-speech
audio = client.tts.synthesize(
    text="Hello world",
    voice="en-US-Neural2-A"
)
audio.save("output.mp3")

# Chat
conversation = client.llm.create_conversation(
    model="gpt-3.5-turbo"
)
response = conversation.send_message("Hello!")
print(response.content)
```

## 5. Web Dashboard

Access the web dashboard at: http://localhost:3000

Features:
- 🎤 Record and transcribe audio
- 🔊 Test text-to-speech voices
- 💬 Chat interface
- 📊 Usage analytics
- ⚙️ Pipeline builder
- 🔑 API key management

## 6. Common Tasks

### Get API Key for Programmatic Access

```bash
curl -X POST http://localhost:8080/api/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Development Key",
    "expiresAt": "2026-12-31T23:59:59Z"
  }'
```

### List Available Voices

```bash
curl http://localhost:8080/api/tts/voices \
  -H "Authorization: Bearer $TOKEN"
```

### Check Service Health

```bash
curl http://localhost:8080/health
```

### View Usage Metrics

```bash
curl http://localhost:8080/api/users/me/usage \
  -H "Authorization: Bearer $TOKEN"
```

## 7. Next Steps

Now that you're up and running:

1. **Explore APIs**: Read the [API Documentation](../api/)
2. **Build Pipelines**: Create custom workflows with the [Pipeline Service](../api/pipeline-service.md)
3. **Integrate**: Use SDKs in your application
4. **Optimize**: Learn [Best Practices](./best-practices.md)
5. **Deploy**: Follow [Production Deployment Guide](../deployment/production.md)

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs gateway
docker-compose logs asr-service

# Restart services
docker-compose restart

# Rebuild if needed
docker-compose down
docker-compose up -d --build
```

### Authentication Errors

- Verify token is not expired (tokens expire after 24 hours)
- Refresh token using `/api/auth/refresh` endpoint
- Check Authorization header format: `Bearer <token>`

### Service Unavailable

- Ensure all containers are healthy: `docker-compose ps`
- Check service logs: `docker-compose logs <service-name>`
- Verify ports are not in use by other applications

### Audio Format Issues

- Supported formats: MP3, WAV, M4A, FLAC, OGG
- Max file size: 25MB
- Max duration: 10 minutes
- Convert unsupported formats using FFmpeg

## Support

- 📖 [Documentation](../README.md)
- 💬 [Discord Community](https://discord.gg/ai-smartlite)
- 🐛 [Report Issues](https://github.com/VinaChat/AI_SMARTLITE/issues)
- 📧 Email: support@ai-smartlite.com

## Example Projects

Check out example projects:
- [Voice Assistant App](https://github.com/VinaChat/AI_SMARTLITE-examples/voice-assistant)
- [Meeting Transcriber](https://github.com/VinaChat/AI_SMARTLITE-examples/meeting-transcriber)
- [Language Translator](https://github.com/VinaChat/AI_SMARTLITE-examples/translator)
