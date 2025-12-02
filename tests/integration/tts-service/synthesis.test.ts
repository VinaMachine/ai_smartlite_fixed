import { describe, test, expect, beforeEach } from '@jest/globals';
import { ttsClient } from '../../shared/client';
import { fixtures } from '../../shared/fixtures';
import { db } from '../../shared/database';

describe('TTS Service Integration Tests', () => {
  beforeEach(async () => {
    await db.cleanup(['tts_requests']);
  });

  describe('Health Check', () => {
    test('should return healthy status', async () => {
      const response = await ttsClient.get('/health');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'healthy');
    });
  });

  describe('TTS API', () => {
    test('should create TTS request', async () => {
      const ttsData = fixtures.ttsRequest.valid();
      
      const response = await ttsClient.post('/api/v1/synthesize', ttsData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('status', 'pending');
      expect(response.data).toHaveProperty('text', ttsData.text);
    });

    test('should reject empty text', async () => {
      const invalidData = {
        text: '',
        voice: 'en-US-Neural2-A',
        language: 'en',
      };

      await expect(ttsClient.post('/api/v1/synthesize', invalidData))
        .rejects.toMatchObject({
          response: { status: 400 },
        });
    });

    test('should get TTS request by id', async () => {
      const ttsData = fixtures.ttsRequest.valid();
      const createResponse = await ttsClient.post('/api/v1/synthesize', ttsData);
      const requestId = createResponse.data.id;

      const response = await ttsClient.get(`/api/v1/synthesize/${requestId}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', requestId);
    });

    test('should list available voices', async () => {
      const response = await ttsClient.get('/api/v1/voices');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.voices)).toBe(true);
      expect(response.data.voices.length).toBeGreaterThan(0);
    });
  });

  describe('Voice Support', () => {
    test('should support different voices', async () => {
      const voices = ['en-US-Neural2-A', 'en-US-Neural2-B', 'en-GB-Neural2-A'];

      for (const voice of voices) {
        const data = { ...fixtures.ttsRequest.valid(), voice };
        const response = await ttsClient.post('/api/v1/synthesize', data);
        expect(response.status).toBe(201);
        expect(response.data.voice).toBe(voice);
      }
    });
  });
});
