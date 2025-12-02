import { describe, test, expect, beforeEach } from '@jest/globals';
import { asrClient } from '../../shared/client';
import { fixtures } from '../../shared/fixtures';
import { db } from '../../shared/database';

describe('ASR Service Integration Tests', () => {
  beforeEach(async () => {
    await db.cleanup(['transcriptions']);
  });

  describe('Health Check', () => {
    test('should return healthy status', async () => {
      const response = await asrClient.get('/health');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'healthy');
    });
  });

  describe('Transcription API', () => {
    test('should create transcription request', async () => {
      const transcriptionData = fixtures.transcription.valid();
      
      const response = await asrClient.post('/api/v1/transcribe', transcriptionData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('status', 'pending');
      expect(response.data).toHaveProperty('audioUrl', transcriptionData.audioUrl);
    });

    test('should reject invalid audio URL', async () => {
      const invalidData = {
        audioUrl: 'not-a-valid-url',
        language: 'en',
      };

      await expect(asrClient.post('/api/v1/transcribe', invalidData))
        .rejects.toMatchObject({
          response: { status: 400 },
        });
    });

    test('should get transcription by id', async () => {
      const transcriptionData = fixtures.transcription.valid();
      const createResponse = await asrClient.post('/api/v1/transcribe', transcriptionData);
      const transcriptionId = createResponse.data.id;

      const response = await asrClient.get(`/api/v1/transcribe/${transcriptionId}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', transcriptionId);
    });

    test('should return 404 for non-existent transcription', async () => {
      await expect(asrClient.get('/api/v1/transcribe/non-existent-id'))
        .rejects.toMatchObject({
          response: { status: 404 },
        });
    });
  });

  describe('Language Support', () => {
    test('should support multiple languages', async () => {
      const languages = ['en', 'es', 'fr', 'de'];

      for (const lang of languages) {
        const data = { ...fixtures.transcription.valid(), language: lang };
        const response = await asrClient.post('/api/v1/transcribe', data);
        expect(response.status).toBe(201);
        expect(response.data.language).toBe(lang);
      }
    });
  });
});
