import { describe, test, expect } from '@jest/globals';
import { gatewayClient } from '../../shared/client';

describe('Gateway Integration Tests', () => {
  describe('Health Check', () => {
    test('should return healthy status', async () => {
      const response = await gatewayClient.get('/health');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'healthy');
    });
  });

  describe('Service Routing', () => {
    test('should route to ASR service', async () => {
      const response = await gatewayClient.get('/asr/health');
      expect(response.status).toBe(200);
    });

    test('should route to TTS service', async () => {
      const response = await gatewayClient.get('/tts/health');
      expect(response.status).toBe(200);
    });

    test('should route to LLM service', async () => {
      const response = await gatewayClient.get('/llm/health');
      expect(response.status).toBe(200);
    });

    test('should route to Pipeline service', async () => {
      const response = await gatewayClient.get('/pipeline/health');
      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for unknown routes', async () => {
      await expect(gatewayClient.get('/unknown/path'))
        .rejects.toMatchObject({
          response: { status: 404 },
        });
    });
  });

  describe('CORS', () => {
    test('should include CORS headers', async () => {
      const response = await gatewayClient.get('/health');
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});
