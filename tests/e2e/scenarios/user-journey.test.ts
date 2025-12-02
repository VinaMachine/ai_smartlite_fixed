import { describe, test, expect, beforeAll } from '@jest/globals';
import { gatewayClient } from '../../shared/client';
import { fixtures } from '../../shared/fixtures';
import { db } from '../../shared/database';

describe('E2E: User Journey', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await db.cleanup(['users', 'sessions']);
  });

  test('should complete full user registration and usage flow', async () => {
    // Step 1: Register user
    console.log('Step 1: Registering user...');
    const userData = fixtures.user.valid();
    const registerResponse = await gatewayClient.post('/api/auth/register', userData);

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.data).toHaveProperty('userId');
    userId = registerResponse.data.userId;

    // Step 2: Login
    console.log('Step 2: Logging in...');
    const loginResponse = await gatewayClient.post('/api/auth/login', {
      email: userData.email,
      password: userData.password,
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.data).toHaveProperty('token');
    authToken = loginResponse.data.token;

    // Set auth token for subsequent requests
    gatewayClient.setAuthToken(authToken);

    // Step 3: Create transcription
    console.log('Step 3: Creating transcription...');
    const transcription = await gatewayClient.post('/api/asr/transcribe',
      fixtures.transcription.valid()
    );

    expect(transcription.status).toBe(201);
    expect(transcription.data).toHaveProperty('id');

    // Step 4: Create LLM conversation
    console.log('Step 4: Creating LLM conversation...');
    const conversation = await gatewayClient.post('/api/llm/conversations',
      fixtures.llmConversation.valid()
    );

    expect(conversation.status).toBe(201);
    expect(conversation.data).toHaveProperty('id');

    // Step 5: Create TTS request
    console.log('Step 5: Creating TTS request...');
    const ttsRequest = await gatewayClient.post('/api/tts/synthesize',
      fixtures.ttsRequest.valid()
    );

    expect(ttsRequest.status).toBe(201);
    expect(ttsRequest.data).toHaveProperty('id');

    // Step 6: Check usage metrics
    console.log('Step 6: Checking usage metrics...');
    const metrics = await gatewayClient.get('/api/users/me/metrics');

    expect(metrics.status).toBe(200);
    expect(metrics.data).toHaveProperty('requestCount');

    console.log('✓ Complete user journey executed successfully');
  }, 60000);
});
