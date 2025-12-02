# ASR Service API

The Automatic Speech Recognition (ASR) service transcribes audio files into text.

## Base URL

```
Gateway: /api/asr
Direct: http://localhost:8001/api/v1
```

## Endpoints

### Transcribe Audio

Transcribe an audio file to text.

**Endpoint:** `POST /transcribe`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
audio: <audio_file>
language: en (optional)
model: whisper-large-v3 (optional)
```

**Supported Audio Formats:**
- MP3, WAV, M4A, FLAC, OGG
- Max file size: 25MB
- Max duration: 10 minutes

**Example (cURL):**
```bash
curl -X POST http://localhost:8080/api/asr/transcribe \
  -H "Authorization: Bearer <token>" \
  -F "audio=@recording.mp3" \
  -F "language=en" \
  -F "model=whisper-large-v3"
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "cm1trans123xyz",
    "status": "processing",
    "message": "Transcription job created"
  }
}
```

### Get Transcription Status

Check the status of a transcription job.

**Endpoint:** `GET /transcriptions/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "cm1trans123xyz",
    "status": "completed",
    "audioUrl": "https://storage.example.com/audio/file.mp3",
    "transcriptText": "Hello, this is a test transcription.",
    "language": "en",
    "duration": 3.5,
    "model": "whisper-large-v3",
    "confidence": 0.98,
    "createdAt": "2025-12-20T10:00:00Z",
    "completedAt": "2025-12-20T10:00:05Z",
    "metadata": {
      "words": [
        {
          "word": "Hello",
          "start": 0.0,
          "end": 0.5,
          "confidence": 0.99
        },
        {
          "word": "this",
          "start": 0.6,
          "end": 0.8,
          "confidence": 0.98
        }
      ]
    }
  }
}
```

### List Transcriptions

Get all transcriptions for the current user.

**Endpoint:** `GET /transcriptions`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `status` (optional: pending, processing, completed, failed)
- `language` (optional: en, es, fr, etc.)

**Example:**
```
GET /transcriptions?page=1&limit=10&status=completed
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "transcriptions": [
      {
        "id": "cm1trans123xyz",
        "status": "completed",
        "transcriptText": "Hello, world!",
        "language": "en",
        "duration": 2.5,
        "confidence": 0.97,
        "createdAt": "2025-12-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```

### Transcribe with Real-time Streaming (WebSocket)

Real-time audio transcription via WebSocket.

**Endpoint:** `WS /transcribe/stream`

**Connection:**
```javascript
const ws = new WebSocket('ws://localhost:8001/api/v1/transcribe/stream?token=<jwt_token>');

ws.onopen = () => {
  // Send configuration
  ws.send(JSON.stringify({
    type: 'config',
    language: 'en',
    sampleRate: 16000
  }));
  
  // Send audio chunks
  ws.send(audioChunk); // ArrayBuffer
};

ws.onmessage = (event) => {
  const result = JSON.parse(event.data);
  console.log(result.transcript);
};
```

**Stream Messages:**

Config message:
```json
{
  "type": "config",
  "language": "en",
  "sampleRate": 16000
}
```

Transcription result:
```json
{
  "type": "transcript",
  "text": "Hello world",
  "isFinal": false,
  "confidence": 0.95,
  "timestamp": 1.5
}
```

### Delete Transcription

Delete a transcription record.

**Endpoint:** `DELETE /transcriptions/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Transcription deleted successfully"
}
```

## Supported Languages

| Code | Language | Model Support |
|------|----------|---------------|
| en | English | ✅ All models |
| es | Spanish | ✅ All models |
| fr | French | ✅ All models |
| de | German | ✅ All models |
| it | Italian | ✅ All models |
| pt | Portuguese | ✅ All models |
| ru | Russian | ✅ All models |
| zh | Chinese | ✅ All models |
| ja | Japanese | ✅ All models |
| ko | Korean | ✅ All models |

## Available Models

### Whisper Large v3
- **ID:** `whisper-large-v3`
- **Quality:** Highest
- **Speed:** Slower
- **Use case:** Production transcription

### Whisper Medium
- **ID:** `whisper-medium`
- **Quality:** High
- **Speed:** Medium
- **Use case:** Balanced quality/speed

### Whisper Base
- **ID:** `whisper-base`
- **Quality:** Good
- **Speed:** Fast
- **Use case:** Real-time applications

### Whisper Tiny
- **ID:** `whisper-tiny`
- **Quality:** Fair
- **Speed:** Very fast
- **Use case:** Testing, low-resource environments

## Processing Time

| Model | Average Time (per minute of audio) |
|-------|-------------------------------------|
| Whisper Tiny | 5-10 seconds |
| Whisper Base | 10-20 seconds |
| Whisper Medium | 20-40 seconds |
| Whisper Large v3 | 40-90 seconds |

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_AUDIO_FORMAT` | Unsupported audio format |
| `AUDIO_TOO_LARGE` | Audio file exceeds size limit |
| `AUDIO_TOO_LONG` | Audio duration exceeds limit |
| `INVALID_LANGUAGE` | Unsupported language code |
| `TRANSCRIPTION_FAILED` | Processing error occurred |
| `TRANSCRIPTION_NOT_FOUND` | Invalid transcription ID |

## Usage Examples

### Python
```python
import requests

url = "http://localhost:8080/api/asr/transcribe"
headers = {"Authorization": f"Bearer {token}"}
files = {"audio": open("recording.mp3", "rb")}
data = {"language": "en", "model": "whisper-large-v3"}

response = requests.post(url, headers=headers, files=files, data=data)
result = response.json()
transcription_id = result["data"]["id"]

# Check status
status_url = f"{url}s/{transcription_id}"
status_response = requests.get(status_url, headers=headers)
print(status_response.json())
```

### JavaScript
```javascript
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('language', 'en');
formData.append('model', 'whisper-large-v3');

const response = await fetch('http://localhost:8080/api/asr/transcribe', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
const transcriptionId = result.data.id;

// Poll for status
const checkStatus = async () => {
  const statusResponse = await fetch(
    `http://localhost:8080/api/asr/transcriptions/${transcriptionId}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return await statusResponse.json();
};
```

## Best Practices

1. **Audio Quality**: Use clear audio with minimal background noise
2. **File Size**: Compress audio files before upload
3. **Model Selection**: Use smaller models for real-time applications
4. **Language**: Specify language when known for better accuracy
5. **Polling**: Poll status every 2-5 seconds, not continuously
6. **Error Handling**: Implement retry logic with exponential backoff
7. **Batch Processing**: Process multiple files in parallel for efficiency
