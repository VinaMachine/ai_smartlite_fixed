# Best Practices Guide

Follow these guidelines to build robust, efficient, and maintainable applications with AI_SMARTLITE.

## General Principles

### 1. Error Handling

**Always implement comprehensive error handling:**

```javascript
try {
  const result = await client.asr.transcribe({
    audioFile: './audio.mp3'
  });
  console.log(result.text);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Wait and retry
    await sleep(error.retryAfter * 1000);
    return retry();
  } else if (error.code === 'AUDIO_TOO_LARGE') {
    // Split audio file
    return processInChunks(audioFile);
  } else {
    // Log and alert
    logger.error('Transcription failed', error);
    alertUser('Processing failed, please try again');
  }
}
```

### 2. Retry Logic

**Implement exponential backoff:**

```python
import time
from functools import wraps

def retry_with_backoff(retries=3, backoff_factor=2):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == retries - 1:
                        raise
                    wait_time = backoff_factor ** attempt
                    time.sleep(wait_time)
            return None
        return wrapper
    return decorator

@retry_with_backoff(retries=3)
def transcribe_audio(audio_file):
    return client.asr.transcribe(audio_file=audio_file)
```

### 3. Rate Limiting

**Implement client-side rate limiting:**

```javascript
class RateLimiter {
  constructor(maxRequests, perSeconds) {
    this.maxRequests = maxRequests;
    this.perSeconds = perSeconds;
    this.queue = [];
  }

  async acquire() {
    const now = Date.now();
    this.queue = this.queue.filter(t => now - t < this.perSeconds * 1000);
    
    if (this.queue.length >= this.maxRequests) {
      const oldestRequest = this.queue[0];
      const waitTime = this.perSeconds * 1000 - (now - oldestRequest);
      await sleep(waitTime);
      return this.acquire();
    }
    
    this.queue.push(now);
  }
}

const limiter = new RateLimiter(60, 60); // 60 req/min

async function makeRequest() {
  await limiter.acquire();
  return client.makeCall();
}
```

## ASR Best Practices

### Audio Preprocessing

**Clean audio before transcription:**

```python
from pydub import AudioSegment
from pydub.effects import normalize

def preprocess_audio(input_path, output_path):
    # Load audio
    audio = AudioSegment.from_file(input_path)
    
    # Normalize volume
    audio = normalize(audio)
    
    # Convert to mono
    audio = audio.set_channels(1)
    
    # Set sample rate to 16kHz
    audio = audio.set_frame_rate(16000)
    
    # Remove silence
    audio = audio.strip_silence(
        silence_thresh=-40,
        silence_len=500
    )
    
    # Export
    audio.export(output_path, format="wav")
    
    return output_path
```

### Chunking Long Audio

**Split large files:**

```javascript
async function transcribeLongAudio(audioFile) {
  const chunks = await splitAudio(audioFile, {
    chunkLength: 10 * 60 * 1000, // 10 minutes
    overlap: 1000 // 1 second overlap
  });
  
  const transcriptions = await Promise.all(
    chunks.map(chunk => client.asr.transcribe({
      audioFile: chunk,
      language: 'en'
    }))
  );
  
  return transcriptions
    .map(t => t.text)
    .join(' ');
}
```

### Language Detection

**Auto-detect language when unknown:**

```python
# Let service detect language
transcription = client.asr.transcribe(
    audio_file="audio.mp3",
    language="auto"  # Auto-detect
)

detected_language = transcription.language
print(f"Detected language: {detected_language}")
```

### Model Selection

**Choose appropriate model:**

- **Real-time**: Use `whisper-tiny` or `whisper-base`
- **Balanced**: Use `whisper-medium`
- **Production**: Use `whisper-large-v3`
- **Offline**: Download and host models locally

## TTS Best Practices

### Text Formatting

**Prepare text for speech:**

```python
def prepare_text_for_tts(text):
    import re
    
    # Expand abbreviations
    text = text.replace("Dr.", "Doctor")
    text = text.replace("Mr.", "Mister")
    text = text.replace("Mrs.", "Misses")
    
    # Format numbers
    text = re.sub(r'\b(\d+)\b', lambda m: num2words(int(m.group(1))), text)
    
    # Remove URLs
    text = re.sub(r'http\S+|www.\S+', '', text)
    
    # Clean special characters
    text = re.sub(r'[^\w\s.,!?-]', '', text)
    
    return text.strip()

text = prepare_text_for_tts("Dr. Smith earned $100 from www.example.com")
audio = client.tts.synthesize(text=text, voice="en-US-Neural2-A")
```

### SSML for Control

**Use SSML for better control:**

```xml
<speak>
  Welcome to our service.
  <break time="500ms"/>
  <emphasis level="strong">This is important!</emphasis>
  <break time="300ms"/>
  Your order number is 
  <say-as interpret-as="characters">ABC123</say-as>
  <break time="200ms"/>
  The total is 
  <say-as interpret-as="currency" language="en-US">$42.50</say-as>
</speak>
```

### Voice Selection

**Test voices before production:**

```javascript
// Get sample audio for all voices
async function compareVoices(text) {
  const voices = await client.tts.getVoices({
    language: 'en-US',
    model: 'neural'
  });
  
  const samples = await Promise.all(
    voices.slice(0, 5).map(async voice => ({
      voiceId: voice.id,
      name: voice.name,
      audio: await client.tts.synthesize({
        text,
        voice: voice.id
      })
    }))
  );
  
  return samples;
}
```

### Caching

**Cache frequently used audio:**

```python
import hashlib
import os

class TTSCache:
    def __init__(self, cache_dir="./tts_cache"):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
    
    def get_cache_key(self, text, voice):
        content = f"{text}:{voice}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def get(self, text, voice):
        key = self.get_cache_key(text, voice)
        cache_path = os.path.join(self.cache_dir, f"{key}.mp3")
        
        if os.path.exists(cache_path):
            return cache_path
        return None
    
    def set(self, text, voice, audio_path):
        key = self.get_cache_key(text, voice)
        cache_path = os.path.join(self.cache_dir, f"{key}.mp3")
        shutil.copy(audio_path, cache_path)
        return cache_path

cache = TTSCache()

def synthesize_with_cache(text, voice):
    cached = cache.get(text, voice)
    if cached:
        return cached
    
    audio = client.tts.synthesize(text=text, voice=voice)
    return cache.set(text, voice, audio.path)
```

## LLM Best Practices

### Prompt Engineering

**Write effective prompts:**

```javascript
const systemPrompt = `You are a helpful customer support assistant.

Guidelines:
- Be concise and professional
- Provide step-by-step instructions
- Ask clarifying questions if needed
- Admit when you don't know something
- Never share sensitive information

Context: Customer support for AI_SMARTLITE platform`;

const conversation = await client.llm.createConversation({
  model: 'gpt-4-turbo',
  systemPrompt,
  temperature: 0.3 // Lower for consistent, factual responses
});
```

### Context Management

**Manage conversation context:**

```python
class ConversationManager:
    def __init__(self, client, max_tokens=4000):
        self.client = client
        self.max_tokens = max_tokens
        self.messages = []
    
    def add_message(self, role, content):
        self.messages.append({"role": role, "content": content})
        self._trim_context()
    
    def _trim_context(self):
        # Keep system message and recent messages
        if len(self.messages) > 1:
            system_msg = self.messages[0]
            recent = self.messages[-10:]  # Keep last 10 messages
            self.messages = [system_msg] + recent
    
    async def send_message(self, content):
        self.add_message("user", content)
        response = await self.client.llm.send_message(
            conversation_id=self.conversation_id,
            content=content
        )
        self.add_message("assistant", response.content)
        return response
```

### Streaming Responses

**Use streaming for better UX:**

```javascript
async function streamResponse(conversationId, message) {
  const response = await fetch(`/api/llm/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: message, stream: true })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.type === 'token') {
          accumulated += data.content;
          updateUI(accumulated); // Update UI in real-time
        }
      }
    }
  }
  
  return accumulated;
}
```

### Cost Optimization

**Reduce token usage:**

```python
def optimize_prompt(text, max_length=1000):
    # Summarize long inputs
    if len(text) > max_length:
        summary = client.llm.completion(
            prompt=f"Summarize in {max_length//4} words: {text}",
            model="gpt-3.5-turbo",
            max_tokens=max_length//2
        )
        return summary.content
    return text

# Use smaller models when possible
def choose_model(task_complexity):
    if task_complexity == "simple":
        return "gpt-3.5-turbo"  # Fast and cheap
    elif task_complexity == "medium":
        return "gpt-4"
    else:
        return "gpt-4-turbo"  # Complex tasks only
```

## Pipeline Best Practices

### Modular Design

**Create reusable pipeline components:**

```json
{
  "name": "Translation Pipeline",
  "config": {
    "steps": [
      {
        "id": "transcribe",
        "service": "asr",
        "action": "transcribe",
        "params": {
          "model": "whisper-large-v3"
        }
      },
      {
        "id": "detect_language",
        "service": "llm",
        "action": "completion",
        "params": {
          "model": "gpt-3.5-turbo",
          "systemPrompt": "Detect language and respond with ISO code only"
        },
        "input": {
          "prompt": "{{transcribe.transcript}}"
        }
      },
      {
        "id": "translate",
        "service": "llm",
        "action": "completion",
        "params": {
          "model": "gpt-4-turbo"
        },
        "input": {
          "prompt": "Translate from {{detect_language.content}} to English: {{transcribe.transcript}}"
        }
      },
      {
        "id": "synthesize",
        "service": "tts",
        "action": "synthesize",
        "params": {
          "voice": "en-US-Neural2-A"
        },
        "input": {
          "text": "{{translate.content}}"
        }
      }
    ],
    "errorHandling": {
      "retryAttempts": 2,
      "retryDelay": 1000,
      "continueOnError": false
    }
  }
}
```

### Error Recovery

**Implement fallback strategies:**

```json
{
  "steps": [
    {
      "id": "primary_transcription",
      "service": "asr",
      "params": {"model": "whisper-large-v3"},
      "onError": "fallback_transcription"
    },
    {
      "id": "fallback_transcription",
      "service": "asr",
      "params": {"model": "whisper-base"},
      "condition": "{{primary_transcription.error}}"
    }
  ]
}
```

### Monitoring

**Track pipeline performance:**

```python
import time
import logging

class PipelineMonitor:
    def __init__(self):
        self.metrics = {}
    
    def log_execution(self, pipeline_id, execution_id, result):
        if pipeline_id not in self.metrics:
            self.metrics[pipeline_id] = []
        
        self.metrics[pipeline_id].append({
            'execution_id': execution_id,
            'status': result.status,
            'duration': result.execution_time,
            'steps': len(result.steps),
            'timestamp': time.time()
        })
        
        # Alert on failures
        if result.status == 'failed':
            logging.error(f"Pipeline {pipeline_id} failed: {result.error}")
            self.alert_team(pipeline_id, result)
    
    def get_success_rate(self, pipeline_id, window_hours=24):
        metrics = self.metrics.get(pipeline_id, [])
        cutoff = time.time() - (window_hours * 3600)
        recent = [m for m in metrics if m['timestamp'] > cutoff]
        
        if not recent:
            return 0.0
        
        successes = sum(1 for m in recent if m['status'] == 'completed')
        return successes / len(recent)
```

## Security Best Practices

### API Key Management

**Secure credential storage:**

```javascript
// ❌ Bad - Hard-coded credentials
const apiKey = "sk_live_abc123def456";

// ✅ Good - Environment variables
const apiKey = process.env.AI_SMARTLITE_API_KEY;

// ✅ Better - Secret management service
const apiKey = await secretsManager.getSecret('ai-smartlite-api-key');
```

### Input Validation

**Validate all inputs:**

```python
def validate_audio_file(file_path):
    import os
    from pydub import AudioSegment
    
    # Check file exists
    if not os.path.exists(file_path):
        raise ValueError("File not found")
    
    # Check file size (max 25MB)
    if os.path.getsize(file_path) > 25 * 1024 * 1024:
        raise ValueError("File too large")
    
    # Check audio format
    try:
        audio = AudioSegment.from_file(file_path)
    except Exception as e:
        raise ValueError(f"Invalid audio format: {e}")
    
    # Check duration (max 10 minutes)
    if len(audio) > 10 * 60 * 1000:
        raise ValueError("Audio too long")
    
    return True
```

### Rate Limit Handling

**Respect rate limits:**

```python
class APIClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.rate_limit_remaining = None
        self.rate_limit_reset = None
    
    def make_request(self, endpoint, data):
        # Check rate limit
        if self.rate_limit_remaining == 0:
            wait_time = self.rate_limit_reset - time.time()
            if wait_time > 0:
                time.sleep(wait_time)
        
        response = requests.post(endpoint, json=data)
        
        # Update rate limit info
        self.rate_limit_remaining = int(
            response.headers.get('X-RateLimit-Remaining', 0)
        )
        self.rate_limit_reset = int(
            response.headers.get('X-RateLimit-Reset', 0)
        )
        
        return response.json()
```

## Performance Optimization

### Parallel Processing

**Process multiple requests concurrently:**

```javascript
async function processMultipleFiles(audioFiles) {
  // Process in batches to avoid overwhelming the service
  const batchSize = 5;
  const results = [];
  
  for (let i = 0; i < audioFiles.length; i += batchSize) {
    const batch = audioFiles.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(file => client.asr.transcribe({ audioFile: file }))
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

### Connection Pooling

**Reuse connections:**

```python
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

def create_session():
    session = requests.Session()
    
    # Connection pooling
    adapter = HTTPAdapter(
        pool_connections=10,
        pool_maxsize=20,
        max_retries=Retry(
            total=3,
            backoff_factor=0.3,
            status_forcelist=[500, 502, 503, 504]
        )
    )
    
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    
    return session
```

## Monitoring & Logging

### Structured Logging

```python
import logging
import json

class StructuredLogger:
    def __init__(self, name):
        self.logger = logging.getLogger(name)
    
    def log(self, level, message, **kwargs):
        log_entry = {
            'message': message,
            'timestamp': time.time(),
            **kwargs
        }
        self.logger.log(level, json.dumps(log_entry))
    
    def info(self, message, **kwargs):
        self.log(logging.INFO, message, **kwargs)
    
    def error(self, message, **kwargs):
        self.log(logging.ERROR, message, **kwargs)

logger = StructuredLogger('ai-smartlite')

logger.info('Transcription started', 
    audio_file='recording.mp3',
    user_id='user123',
    model='whisper-large-v3'
)
```

### Metrics Collection

```javascript
class MetricsCollector {
  constructor() {
    this.metrics = [];
  }
  
  track(event, data) {
    this.metrics.push({
      event,
      data,
      timestamp: Date.now()
    });
  }
  
  async flush() {
    if (this.metrics.length === 0) return;
    
    await fetch('/api/metrics', {
      method: 'POST',
      body: JSON.stringify(this.metrics)
    });
    
    this.metrics = [];
  }
}

const metrics = new MetricsCollector();

metrics.track('transcription_started', { fileSize: 1024000 });
metrics.track('transcription_completed', { duration: 5000 });

setInterval(() => metrics.flush(), 60000); // Flush every minute
```

## Testing

### Integration Tests

```python
import pytest

def test_voice_assistant_pipeline():
    # Create pipeline
    pipeline = client.pipelines.create({
        'name': 'Test Voice Assistant',
        'config': { ... }
    })
    
    # Execute with test audio
    execution = client.pipelines.execute(
        pipeline.id,
        audio_file='test_audio.mp3'
    )
    
    # Wait for completion
    result = client.pipelines.wait_for_completion(execution.id)
    
    # Assertions
    assert result.status == 'completed'
    assert 'audioUrl' in result.output_data['speak']
    assert len(result.output_data['respond']['content']) > 0
```

## Summary Checklist

- ✅ Implement retry logic with exponential backoff
- ✅ Validate inputs before API calls
- ✅ Use appropriate models for task complexity
- ✅ Cache frequently used results
- ✅ Monitor rate limits and usage
- ✅ Implement structured logging
- ✅ Secure API keys properly
- ✅ Handle errors gracefully
- ✅ Use streaming for long operations
- ✅ Test thoroughly before production
