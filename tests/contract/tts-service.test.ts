import { describe, test, expect } from '@jest/globals';
import { ttsClient } from '../shared/client';

describe('Contract: TTS Service API', () => {
  describe('POST /api/v1/synthesize', () => {
    test('should accept valid TTS request', async () => {
      const validRequest = {
        text: 'Hello, this is a test.',
        voice: 'en-US-Neural2-A',
        language: 'en',
      };

      const response = await ttsClient.post('/api/v1/synthesize', validRequest);

      expect(response.status).toBe(201);
      expect(response.data).toMatchObject({
        id: expect.any(String),
        text: validRequest.text,
        voice: validRequest.voice,
        language: validRequest.language,
        status: expect.stringMatching(/^(pending|processing)$/),
        createdAt: expect.any(String),
      });
    });

    test('should reject empty text', async () => {
      const invalidRequest = {
        text: '',
        voice: 'en-US-Neural2-A',
        language: 'en',
      };

      await expect(ttsClient.post('/api/v1/synthesize', invalidRequest))
        .rejects.toMatchObject({
          response: { status: 400 },
        });
    });

    test('should reject missing voice', async () => {
      const invalidRequest = {
        text: 'Hello',
        language: 'en',
      };

      await expect(ttsClient.post('/api/v1/synthesize', invalidRequest))
        .rejects.toMatchObject({
          response: { status: 400 },
        });
    });
  });

  describe('GET /api/v1/voices', () => {
    test('should return list of available voices', async () => {
      const response = await ttsClient.get('/api/v1/voices');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('voices');
      expect(Array.isArray(response.data.voices)).toBe(true);
      
      if (response.data.voices.length > 0) {
        expect(response.data.voices[0]).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          language: expect.any(String),
        });
      }
    });
  });

  describe('GET /api/v1/synthesize/:id', () => {
    test('should return TTS request with correct schema', async () => {
      const createResponse = await ttsClient.post('/api/v1/synthesize', {
        text: 'Test',
        voice: 'en-US-Neural2-A',
        language: 'en',
      });
      const requestId = createResponse.data.id;

      const response = await ttsClient.get(`/api/v1/synthesize/${requestId}`);

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        id: requestId,
        text: expect.any(String),
        voice: expect.any(String),
        language: expect.any(String),
        status: expect.stringMatching(/^(pending|processing|completed|failed)$/),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });
});
