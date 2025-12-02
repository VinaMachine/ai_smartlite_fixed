# TTS Service API

The Text-to-Speech (TTS) service converts text into natural-sounding audio.

## Base URL

```
Gateway: /api/tts
Direct: http://localhost:8002/api/v1
```

## Endpoints

### Synthesize Speech

Convert text to speech.

**Endpoint:** `POST /synthesize`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "Hello, how can I help you today?",
  "voice": "en-US-Neural2-A",
  "language": "en-US",
  "model": "neural",
  "speed": 1.0,
  "pitch": 0.0,
  "format": "mp3"
}
```

**Parameters:**
- `text` (required): Text to synthesize (max 5000 characters)
- `voice` (required): Voice identifier
- `language` (optional): Language code (default: auto-detect)
- `model` (optional): TTS model (default: "neural")
- `speed` (optional): Speech rate 0.5-2.0 (default: 1.0)
- `pitch` (optional): Pitch adjustment -10 to 10 (default: 0)
- `format` (optional): Output format: mp3, wav, ogg (default: mp3)

**Example (cURL):**
```bash
curl -X POST http://localhost:8080/api/tts/synthesize \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world",
    "voice": "en-US-Neural2-A",
    "format": "mp3"
  }'
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "cm1tts123xyz",
    "status": "processing",
    "message": "TTS job created"
  }
}
```

### Get TTS Request Status

Check the status of a TTS synthesis job.

**Endpoint:** `GET /requests/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "cm1tts123xyz",
    "status": "completed",
    "inputText": "Hello, how can I help you today?",
    "audioUrl": "https://storage.example.com/tts/output.mp3",
    "voice": "en-US-Neural2-A",
    "language": "en-US",
    "duration": 2.3,
    "model": "neural",
    "createdAt": "2025-12-20T10:00:00Z",
    "completedAt": "2025-12-20T10:00:02Z",
    "metadata": {
      "characterCount": 34,
      "wordCount": 7,
      "speed": 1.0,
      "pitch": 0.0,
      "format": "mp3"
    }
  }
}
```

### Download Audio

Download the generated audio file.

**Endpoint:** `GET /requests/:id/audio`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
- Content-Type: `audio/mpeg` (or audio/wav, audio/ogg)
- Binary audio data

### List TTS Requests

Get all TTS requests for the current user.

**Endpoint:** `GET /requests`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `status` (optional: pending, processing, completed, failed)
- `voice` (optional: filter by voice ID)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "cm1tts123xyz",
        "status": "completed",
        "inputText": "Hello world",
        "audioUrl": "https://storage.example.com/tts/output.mp3",
        "voice": "en-US-Neural2-A",
        "duration": 1.5,
        "createdAt": "2025-12-20T10:00:00Z"
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

### Delete TTS Request

Delete a TTS request and associated audio.

**Endpoint:** `DELETE /requests/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "TTS request deleted successfully"
}
```

### List Available Voices

Get all available voices.

**Endpoint:** `GET /voices`

**Query Parameters:**
- `language` (optional): Filter by language code
- `gender` (optional): male, female, neutral
- `model` (optional): standard, neural, premium

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "voices": [
      {
        "id": "en-US-Neural2-A",
        "name": "English (US) - Neural Female",
        "language": "en-US",
        "gender": "female",
        "model": "neural",
        "sampleUrl": "https://storage.example.com/samples/en-US-Neural2-A.mp3",
        "features": ["natural", "expressive", "conversational"]
      },
      {
        "id": "en-US-Neural2-D",
        "name": "English (US) - Neural Male",
        "language": "en-US",
        "gender": "male",
        "model": "neural",
        "sampleUrl": "https://storage.example.com/samples/en-US-Neural2-D.mp3",
        "features": ["natural", "professional", "clear"]
      }
    ],
    "total": 150
  }
}
```

### Synthesize with SSML

Advanced speech synthesis using SSML markup.

**Endpoint:** `POST /synthesize/ssml`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "ssml": "<speak>Hello <break time=\"500ms\"/> world! <emphasis level=\"strong\">This is important.</emphasis></speak>",
  "voice": "en-US-Neural2-A",
  "format": "mp3"
}
```

**SSML Features:**
- `<break>` - Add pauses
- `<emphasis>` - Emphasize words
- `<prosody>` - Adjust rate, pitch, volume
- `<say-as>` - Format numbers, dates, etc.

**Response:** Same as standard synthesis

## Supported Languages & Voices

### English
| Voice ID | Name | Gender | Model |
|----------|------|--------|-------|
| en-US-Neural2-A | US English Female | Female | Neural |
| en-US-Neural2-D | US English Male | Male | Neural |
| en-GB-Neural2-A | UK English Female | Female | Neural |
| en-GB-Neural2-B | UK English Male | Male | Neural |
| en-AU-Neural2-A | Australian Female | Female | Neural |

### Spanish
| Voice ID | Name | Gender | Model |
|----------|------|--------|-------|
| es-ES-Neural2-A | Spanish Female | Female | Neural |
| es-ES-Neural2-B | Spanish Male | Male | Neural |
| es-US-Neural2-A | US Spanish Female | Female | Neural |

### French
| Voice ID | Name | Gender | Model |
|----------|------|--------|-------|
| fr-FR-Neural2-A | French Female | Female | Neural |
| fr-FR-Neural2-B | French Male | Male | Neural |

### German
| Voice ID | Name | Gender | Model |
|----------|------|--------|-------|
| de-DE-Neural2-A | German Female | Female | Neural |
| de-DE-Neural2-B | German Male | Male | Neural |

*100+ additional voices available. Use `/voices` endpoint for complete list.*

## Audio Formats

| Format | Extension | Bitrate | Use Case |
|--------|-----------|---------|----------|
| MP3 | .mp3 | 128 kbps | General use, small file size |
| WAV | .wav | 16-bit PCM | High quality, editing |
| OGG | .ogg | 96 kbps | Web streaming |

## TTS Models

### Neural TTS
- **ID:** `neural`
- **Quality:** Natural, human-like
- **Latency:** ~1-2 seconds
- **Cost:** Standard

### Premium TTS
- **ID:** `premium`
- **Quality:** Highest quality, very natural
- **Latency:** ~2-3 seconds
- **Cost:** 2x standard

### Standard TTS
- **ID:** `standard`
- **Quality:** Good, robotic
- **Latency:** ~0.5-1 second
- **Cost:** 0.5x standard

## Rate Limits

| Tier | Requests/Minute | Characters/Month |
|------|-----------------|------------------|
| Free | 20 | 100,000 |
| Basic | 100 | 1,000,000 |
| Pro | 500 | 10,000,000 |
| Enterprise | Custom | Unlimited |

## Error Codes

| Code | Description |
|------|-------------|
| `TEXT_TOO_LONG` | Text exceeds maximum length |
| `INVALID_VOICE` | Voice ID not found |
| `INVALID_LANGUAGE` | Language code not supported |
| `INVALID_FORMAT` | Audio format not supported |
| `INVALID_SSML` | SSML markup is invalid |
| `SYNTHESIS_FAILED` | TTS generation error |
| `REQUEST_NOT_FOUND` | Invalid request ID |

## Usage Examples

### Python
```python
import requests

url = "http://localhost:8080/api/tts/synthesize"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
payload = {
    "text": "Hello, this is a test.",
    "voice": "en-US-Neural2-A",
    "format": "mp3"
}

response = requests.post(url, headers=headers, json=payload)
result = response.json()
request_id = result["data"]["id"]

# Check status
status_url = f"http://localhost:8080/api/tts/requests/{request_id}"
status_response = requests.get(status_url, headers=headers)
audio_url = status_response.json()["data"]["audioUrl"]

# Download audio
audio_response = requests.get(audio_url)
with open("output.mp3", "wb") as f:
    f.write(audio_response.content)
```

### JavaScript
```javascript
const response = await fetch('http://localhost:8080/api/tts/synthesize', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'Hello, this is a test.',
    voice: 'en-US-Neural2-A',
    format: 'mp3'
  })
});

const result = await response.json();
const requestId = result.data.id;

// Poll for completion
const checkStatus = async () => {
  const statusResponse = await fetch(
    `http://localhost:8080/api/tts/requests/${requestId}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  const data = await statusResponse.json();
  
  if (data.data.status === 'completed') {
    return data.data.audioUrl;
  }
};

const audioUrl = await checkStatus();
```

### cURL - Download Direct
```bash
# Synthesize and get request ID
REQUEST_ID=$(curl -X POST http://localhost:8080/api/tts/synthesize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","voice":"en-US-Neural2-A"}' \
  | jq -r '.data.id')

# Wait a moment for processing
sleep 2

# Download audio
curl "http://localhost:8080/api/tts/requests/$REQUEST_ID/audio" \
  -H "Authorization: Bearer $TOKEN" \
  -o output.mp3
```

## Best Practices

1. **Text Length**: Split long texts into smaller chunks
2. **Voice Selection**: Test voices with sample audio
3. **Error Handling**: Implement retry logic for failures
4. **Caching**: Cache generated audio to reduce costs
5. **SSML**: Use SSML for better pronunciation control
6. **Format**: Use MP3 for web, WAV for editing
7. **Speed**: Adjust speed for better comprehension
8. **Rate Limiting**: Implement client-side rate limiting
