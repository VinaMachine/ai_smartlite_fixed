import { describe, test, expect, beforeEach } from '@jest/globals';
import { llmClient } from '../../shared/client';
import { fixtures } from '../../shared/fixtures';
import { db } from '../../shared/database';

describe('LLM Service Integration Tests', () => {
  beforeEach(async () => {
    await db.cleanup(['llm_conversations', 'llm_messages']);
  });

  describe('Health Check', () => {
    test('should return healthy status', async () => {
      const response = await llmClient.get('/health');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'healthy');
    });
  });

  describe('Conversation API', () => {
    test('should create conversation', async () => {
      const conversationData = fixtures.llmConversation.valid();
      
      const response = await llmClient.post('/api/v1/conversations', conversationData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('title', conversationData.title);
      expect(response.data).toHaveProperty('model', conversationData.model);
    });

    test('should send message to conversation', async () => {
      const conversation = await llmClient.post('/api/v1/conversations', 
        fixtures.llmConversation.valid());
      const conversationId = conversation.data.id;

      const message = fixtures.llmMessage.user();
      const response = await llmClient.post(
        `/api/v1/conversations/${conversationId}/messages`,
        message
      );

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('content');
      expect(response.data.role).toBe('user');
    });

    test('should get conversation history', async () => {
      const conversation = await llmClient.post('/api/v1/conversations',
        fixtures.llmConversation.valid());
      const conversationId = conversation.data.id;

      // Send a message
      await llmClient.post(
        `/api/v1/conversations/${conversationId}/messages`,
        fixtures.llmMessage.user()
      );

      const response = await llmClient.get(`/api/v1/conversations/${conversationId}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', conversationId);
      expect(Array.isArray(response.data.messages)).toBe(true);
    });
  });

  describe('Model Support', () => {
    test('should support different models', async () => {
      const models = ['gpt-3.5-turbo', 'gpt-4', 'claude-3-sonnet'];

      for (const model of models) {
        const data = { ...fixtures.llmConversation.valid(), model };
        const response = await llmClient.post('/api/v1/conversations', data);
        expect(response.status).toBe(201);
        expect(response.data.model).toBe(model);
      }
    });
  });
});
