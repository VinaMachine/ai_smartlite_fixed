# Pipeline Service API

The Pipeline service orchestrates multi-step workflows combining ASR, TTS, and LLM services.

## Base URL

```
Gateway: /api/pipelines
Direct: http://localhost:8004/api/v1
```

## Endpoints

### Create Pipeline

Define a new pipeline configuration.

**Endpoint:** `POST /pipelines`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Voice Assistant Pipeline",
  "description": "ASR → LLM → TTS workflow for voice interactions",
  "config": {
    "steps": [
      {
        "id": "transcribe",
        "service": "asr",
        "action": "transcribe",
        "params": {
          "model": "whisper-large-v3",
          "language": "en"
        }
      },
      {
        "id": "generate_response",
        "service": "llm",
        "action": "completion",
        "params": {
          "model": "gpt-4-turbo",
          "temperature": 0.7,
          "systemPrompt": "You are a helpful voice assistant."
        },
        "input": {
          "prompt": "{{transcribe.transcript}}"
        }
      },
      {
        "id": "synthesize_speech",
        "service": "tts",
        "action": "synthesize",
        "params": {
          "voice": "en-US-Neural2-A",
          "format": "mp3"
        },
        "input": {
          "text": "{{generate_response.content}}"
        }
      }
    ],
    "errorHandling": {
      "retryAttempts": 3,
      "retryDelay": 1000,
      "continueOnError": false
    }
  },
  "status": "active"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "cm1pipe123xyz",
    "name": "Voice Assistant Pipeline",
    "description": "ASR → LLM → TTS workflow for voice interactions",
    "status": "active",
    "createdAt": "2025-12-20T10:00:00Z"
  }
}
```

### Execute Pipeline

Run a pipeline with input data.

**Endpoint:** `POST /pipelines/:pipelineId/execute`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: multipart/form-data (for file uploads)
```

**Request Body (multipart/form-data):**
```
audio: <audio_file>
metadata: {"userId": "user123", "sessionId": "session456"}
```

**Or JSON for non-file inputs:**
```json
{
  "input": {
    "text": "Hello, how can I help you?"
  },
  "variables": {
    "userId": "user123"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "executionId": "cm1exec123xyz",
    "pipelineId": "cm1pipe123xyz",
    "status": "running",
    "createdAt": "2025-12-20T10:00:00Z"
  }
}
```

### Get Execution Status

Check pipeline execution status and results.

**Endpoint:** `GET /executions/:executionId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "cm1exec123xyz",
    "pipelineId": "cm1pipe123xyz",
    "status": "completed",
    "inputData": {
      "audioUrl": "https://storage.example.com/input.mp3"
    },
    "outputData": {
      "transcribe": {
        "transcript": "Hello, what's the weather today?",
        "confidence": 0.98
      },
      "generate_response": {
        "content": "I'm sorry, I don't have access to real-time weather data. Please check a weather service.",
        "tokens": 25
      },
      "synthesize_speech": {
        "audioUrl": "https://storage.example.com/output.mp3",
        "duration": 4.2
      }
    },
    "steps": [
      {
        "id": "transcribe",
        "status": "completed",
        "startedAt": "2025-12-20T10:00:01Z",
        "completedAt": "2025-12-20T10:00:05Z",
        "duration": 4000
      },
      {
        "id": "generate_response",
        "status": "completed",
        "startedAt": "2025-12-20T10:00:05Z",
        "completedAt": "2025-12-20T10:00:08Z",
        "duration": 3000
      },
      {
        "id": "synthesize_speech",
        "status": "completed",
        "startedAt": "2025-12-20T10:00:08Z",
        "completedAt": "2025-12-20T10:00:11Z",
        "duration": 3000
      }
    ],
    "executionTime": 10000,
    "createdAt": "2025-12-20T10:00:00Z",
    "completedAt": "2025-12-20T10:00:11Z"
  }
}
```

### List Pipeline Executions

Get execution history for a pipeline.

**Endpoint:** `GET /pipelines/:pipelineId/executions`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `status` (optional: pending, running, completed, failed, cancelled)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "executions": [
      {
        "id": "cm1exec123xyz",
        "status": "completed",
        "executionTime": 10000,
        "createdAt": "2025-12-20T10:00:00Z",
        "completedAt": "2025-12-20T10:00:11Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### List Pipelines

Get all pipelines for the current user.

**Endpoint:** `GET /pipelines`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `status` (optional: active, inactive, archived)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "pipelines": [
      {
        "id": "cm1pipe123xyz",
        "name": "Voice Assistant Pipeline",
        "description": "ASR → LLM → TTS workflow",
        "status": "active",
        "executionCount": 150,
        "lastExecutedAt": "2025-12-20T10:00:00Z",
        "createdAt": "2025-12-19T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### Update Pipeline

Modify pipeline configuration.

**Endpoint:** `PATCH /pipelines/:pipelineId`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Pipeline Name",
  "description": "Updated description",
  "config": { ... },
  "status": "inactive"
}
```

**Response:** `200 OK`

### Delete Pipeline

Delete a pipeline configuration.

**Endpoint:** `DELETE /pipelines/:pipelineId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Pipeline deleted successfully"
}
```

### Cancel Execution

Stop a running pipeline execution.

**Endpoint:** `POST /executions/:executionId/cancel`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "cm1exec123xyz",
    "status": "cancelled",
    "cancelledAt": "2025-12-20T10:05:00Z"
  }
}
```

## Pipeline Configuration

### Step Structure

```json
{
  "id": "step_identifier",
  "service": "asr | tts | llm",
  "action": "service_action",
  "params": {},
  "input": {},
  "condition": "optional_condition",
  "retryOnError": true,
  "timeout": 30000
}
```

### Variable Interpolation

Access previous step outputs:
- `{{step_id.field_name}}` - Get specific field
- `{{input.field_name}}` - Access input data
- `{{env.VARIABLE}}` - Environment variables

### Conditional Execution

```json
{
  "condition": "{{transcribe.confidence}} > 0.9"
}
```

### Error Handling

```json
{
  "errorHandling": {
    "retryAttempts": 3,
    "retryDelay": 1000,
    "continueOnError": false,
    "fallbackStep": "error_handler"
  }
}
```

## Pre-built Pipeline Templates

### Voice Assistant
```
Audio Input → ASR → LLM → TTS → Audio Output
```

### Content Translation
```
Audio Input → ASR → Translation LLM → TTS → Translated Audio
```

### Meeting Transcription
```
Audio Input → ASR → LLM Summarization → Text Output
```

### Voice-to-Text Analysis
```
Audio Input → ASR → LLM Analysis → Structured Data
```

## Usage Examples

### Python - Voice Assistant Pipeline
```python
import requests

base_url = "http://localhost:8080/api/pipelines"
headers = {"Authorization": f"Bearer {token}"}

# Create pipeline
pipeline_config = {
    "name": "Voice Assistant",
    "config": {
        "steps": [
            {
                "id": "transcribe",
                "service": "asr",
                "action": "transcribe",
                "params": {"model": "whisper-large-v3"}
            },
            {
                "id": "respond",
                "service": "llm",
                "action": "completion",
                "params": {"model": "gpt-4-turbo"},
                "input": {"prompt": "{{transcribe.transcript}}"}
            },
            {
                "id": "speak",
                "service": "tts",
                "action": "synthesize",
                "params": {"voice": "en-US-Neural2-A"},
                "input": {"text": "{{respond.content}}"}
            }
        ]
    }
}

pipeline_response = requests.post(
    base_url,
    headers=headers,
    json=pipeline_config
)
pipeline_id = pipeline_response.json()["data"]["id"]

# Execute pipeline
files = {"audio": open("question.mp3", "rb")}
exec_response = requests.post(
    f"{base_url}/{pipeline_id}/execute",
    headers=headers,
    files=files
)
execution_id = exec_response.json()["data"]["executionId"]

# Check status
status_response = requests.get(
    f"{base_url}/../executions/{execution_id}",
    headers=headers
)
result = status_response.json()
audio_url = result["data"]["outputData"]["speak"]["audioUrl"]
```

### JavaScript - Translation Pipeline
```javascript
const pipelineConfig = {
  name: 'Audio Translation',
  config: {
    steps: [
      {
        id: 'transcribe',
        service: 'asr',
        action: 'transcribe',
        params: { language: 'en' }
      },
      {
        id: 'translate',
        service: 'llm',
        action: 'completion',
        params: {
          model: 'gpt-4-turbo',
          systemPrompt: 'Translate to Spanish'
        },
        input: { prompt: '{{transcribe.transcript}}' }
      },
      {
        id: 'speak_spanish',
        service: 'tts',
        action: 'synthesize',
        params: { voice: 'es-ES-Neural2-A' },
        input: { text: '{{translate.content}}' }
      }
    ]
  }
};

const response = await fetch('http://localhost:8080/api/pipelines', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(pipelineConfig)
});

const { id: pipelineId } = (await response.json()).data;
```

## Error Codes

| Code | Description |
|------|-------------|
| `PIPELINE_NOT_FOUND` | Invalid pipeline ID |
| `EXECUTION_NOT_FOUND` | Invalid execution ID |
| `INVALID_CONFIG` | Pipeline configuration error |
| `STEP_FAILED` | Pipeline step execution failed |
| `TIMEOUT_EXCEEDED` | Step exceeded timeout limit |
| `INVALID_INPUT` | Input data validation failed |
| `SERVICE_UNAVAILABLE` | Required service is down |

## Performance

### Typical Execution Times

| Pipeline Type | Average Duration |
|---------------|------------------|
| Voice Assistant | 8-15 seconds |
| Translation | 10-20 seconds |
| Transcription Only | 3-8 seconds |
| Content Analysis | 5-12 seconds |

### Optimization Tips

1. **Parallel Steps**: Run independent steps concurrently
2. **Model Selection**: Use faster models when appropriate
3. **Timeout Configuration**: Set realistic timeouts
4. **Caching**: Cache repeated transformations
5. **Error Handling**: Fail fast on critical errors

## Best Practices

1. **Modular Design**: Keep steps focused and reusable
2. **Error Handling**: Always configure retry logic
3. **Monitoring**: Track execution metrics
4. **Testing**: Test pipelines thoroughly before production
5. **Documentation**: Document pipeline purpose and inputs
6. **Version Control**: Version pipeline configurations
7. **Resource Limits**: Set appropriate timeouts
8. **Input Validation**: Validate inputs at pipeline start
