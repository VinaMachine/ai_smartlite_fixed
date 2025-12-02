# LLM Service API

The Large Language Model (LLM) service provides natural language processing, text generation, and conversational AI capabilities.

## Base URL

```
Gateway: /api/llm
Direct: http://localhost:8003/api/v1
```

## Endpoints

### Create Conversation

Start a new conversation thread.

**Endpoint:** `POST /conversations`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Technical Support Chat",
  "model": "gpt-4-turbo",
  "systemPrompt": "You are a helpful technical support assistant.",
  "temperature": 0.7,
  "maxTokens": 2000
}
```

**Parameters:**
- `title` (optional): Conversation title
- `model` (optional): Model ID (default: "gpt-3.5-turbo")
- `systemPrompt` (optional): System instructions
- `temperature` (optional): 0.0-2.0 (default: 0.7)
- `maxTokens` (optional): Max response tokens (default: 1000)

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "cm1conv123xyz",
    "title": "Technical Support Chat",
    "model": "gpt-4-turbo",
    "systemPrompt": "You are a helpful technical support assistant.",
    "createdAt": "2025-12-20T10:00:00Z"
  }
}
```

### Send Message

Send a message to a conversation.

**Endpoint:** `POST /conversations/:conversationId/messages`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "How do I reset my password?",
  "stream": false
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "cm1conv123xyz",
      "title": "Technical Support Chat"
    },
    "userMessage": {
      "id": "cm1msg123abc",
      "role": "user",
      "content": "How do I reset my password?",
      "tokens": 8,
      "createdAt": "2025-12-20T10:00:00Z"
    },
    "assistantMessage": {
      "id": "cm1msg456def",
      "role": "assistant",
      "content": "To reset your password, follow these steps:\n1. Go to the login page\n2. Click 'Forgot Password'\n3. Enter your email\n4. Check your inbox for reset link",
      "tokens": 45,
      "createdAt": "2025-12-20T10:00:02Z"
    }
  }
}
```

### Stream Message

Send a message with streaming response.

**Endpoint:** `POST /conversations/:conversationId/messages`

**Request Body:**
```json
{
  "content": "Explain quantum computing",
  "stream": true
}
```

**Response:** Server-Sent Events (SSE)
```
Content-Type: text/event-stream

data: {"type":"start","messageId":"cm1msg789ghi"}

data: {"type":"token","content":"Quantum"}

data: {"type":"token","content":" computing"}

data: {"type":"token","content":" is"}

data: {"type":"done","messageId":"cm1msg789ghi","tokens":150}
```

### Get Conversation

Retrieve a conversation with message history.

**Endpoint:** `GET /conversations/:conversationId`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional): Number of messages (default: 50)
- `before` (optional): Message ID for pagination

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "cm1conv123xyz",
    "title": "Technical Support Chat",
    "model": "gpt-4-turbo",
    "systemPrompt": "You are a helpful assistant.",
    "createdAt": "2025-12-20T10:00:00Z",
    "messages": [
      {
        "id": "cm1msg123abc",
        "role": "user",
        "content": "Hello!",
        "tokens": 3,
        "createdAt": "2025-12-20T10:00:00Z"
      },
      {
        "id": "cm1msg456def",
        "role": "assistant",
        "content": "Hi! How can I help you?",
        "tokens": 8,
        "createdAt": "2025-12-20T10:00:01Z"
      }
    ],
    "totalMessages": 2,
    "totalTokens": 11
  }
}
```

### List Conversations

Get all conversations for the current user.

**Endpoint:** `GET /conversations`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `model` (optional): Filter by model

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "cm1conv123xyz",
        "title": "Technical Support Chat",
        "model": "gpt-4-turbo",
        "messageCount": 10,
        "lastMessageAt": "2025-12-20T10:30:00Z",
        "createdAt": "2025-12-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### Update Conversation

Update conversation metadata.

**Endpoint:** `PATCH /conversations/:conversationId`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "systemPrompt": "Updated system instructions"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "cm1conv123xyz",
    "title": "Updated Title",
    "systemPrompt": "Updated system instructions",
    "updatedAt": "2025-12-20T10:35:00Z"
  }
}
```

### Delete Conversation

Delete a conversation and all messages.

**Endpoint:** `DELETE /conversations/:conversationId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

### Text Completion (Single Request)

Get a single completion without conversation context.

**Endpoint:** `POST /completions`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "Write a haiku about programming",
  "model": "gpt-3.5-turbo",
  "temperature": 0.9,
  "maxTokens": 100,
  "stream": false
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "cm1comp123xyz",
    "model": "gpt-3.5-turbo",
    "content": "Code flows like water\nBugs hide in silent shadows\nDebug brings the light",
    "tokens": 25,
    "finishReason": "stop"
  }
}
```

## Available Models

### GPT-4 Turbo
- **ID:** `gpt-4-turbo`
- **Context:** 128K tokens
- **Quality:** Highest
- **Speed:** Fast
- **Cost:** Premium

### GPT-4
- **ID:** `gpt-4`
- **Context:** 8K tokens
- **Quality:** Very High
- **Speed:** Medium
- **Cost:** High

### GPT-3.5 Turbo
- **ID:** `gpt-3.5-turbo`
- **Context:** 16K tokens
- **Quality:** Good
- **Speed:** Very Fast
- **Cost:** Standard

### Claude 3 Opus
- **ID:** `claude-3-opus`
- **Context:** 200K tokens
- **Quality:** Very High
- **Speed:** Fast
- **Cost:** Premium

### Claude 3 Sonnet
- **ID:** `claude-3-sonnet`
- **Context:** 200K tokens
- **Quality:** High
- **Speed:** Very Fast
- **Cost:** Standard

## Parameters

### Temperature
Controls randomness (0.0 - 2.0):
- **0.0-0.3**: Focused, deterministic
- **0.4-0.7**: Balanced (recommended)
- **0.8-1.5**: Creative
- **1.6-2.0**: Very random

### Max Tokens
Maximum response length:
- Minimum: 1
- Maximum: Model-dependent
- Recommended: 500-2000

### Top P (Nucleus Sampling)
Alternative to temperature (0.0 - 1.0):
- **0.1**: Very focused
- **0.5**: Balanced
- **0.9**: Diverse

### Frequency Penalty
Reduce repetition (-2.0 to 2.0):
- **0.0**: No penalty
- **0.5**: Moderate (recommended)
- **1.0**: Strong

### Presence Penalty
Encourage new topics (-2.0 to 2.0):
- **0.0**: No penalty
- **0.5**: Moderate
- **1.0**: Strong

## Rate Limits

| Tier | Requests/Minute | Tokens/Month |
|------|-----------------|--------------|
| Free | 3 | 100,000 |
| Basic | 60 | 2,000,000 |
| Pro | 300 | 10,000,000 |
| Enterprise | Custom | Unlimited |

## Error Codes

| Code | Description |
|------|-------------|
| `CONVERSATION_NOT_FOUND` | Invalid conversation ID |
| `MESSAGE_TOO_LONG` | Message exceeds token limit |
| `INVALID_MODEL` | Model not supported |
| `CONTEXT_LENGTH_EXCEEDED` | Conversation exceeds context window |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `CONTENT_FILTERED` | Response filtered by safety system |
| `MODEL_OVERLOADED` | Model temporarily unavailable |

## Usage Examples

### Python - Conversation
```python
import requests

base_url = "http://localhost:8080/api/llm"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Create conversation
conv_response = requests.post(
    f"{base_url}/conversations",
    headers=headers,
    json={
        "title": "Code Review",
        "model": "gpt-4-turbo",
        "systemPrompt": "You are a code review expert."
    }
)
conversation_id = conv_response.json()["data"]["id"]

# Send message
msg_response = requests.post(
    f"{base_url}/conversations/{conversation_id}/messages",
    headers=headers,
    json={"content": "Review this Python function: def add(a, b): return a+b"}
)
reply = msg_response.json()["data"]["assistantMessage"]["content"]
print(reply)
```

### JavaScript - Streaming
```javascript
const conversationId = 'cm1conv123xyz';
const response = await fetch(
  `http://localhost:8080/api/llm/conversations/${conversationId}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: 'Explain async/await in JavaScript',
      stream: true
    })
  }
);

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.type === 'token') {
        process.stdout.write(data.content);
      }
    }
  }
}
```

### cURL - Quick Completion
```bash
curl -X POST http://localhost:8080/api/llm/completions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is the capital of France?",
    "model": "gpt-3.5-turbo",
    "maxTokens": 50
  }'
```

## Best Practices

1. **System Prompts**: Use clear, specific instructions
2. **Context Management**: Monitor token usage
3. **Conversation Limits**: Archive old conversations
4. **Error Handling**: Implement retry with exponential backoff
5. **Streaming**: Use for better UX in chat interfaces
6. **Model Selection**: Balance cost vs. quality needs
7. **Temperature**: Lower for factual, higher for creative
8. **Rate Limiting**: Implement client-side throttling
9. **Content Safety**: Monitor and filter inappropriate content
10. **Token Optimization**: Trim unnecessary context
