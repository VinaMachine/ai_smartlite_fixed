import { describe, test, expect } from '@jest/globals';
import { llmClient } from '../shared/client';

describe('Contract: LLM Service API', () => {
  describe('POST /api/v1/conversations', () => {
    test('should accept valid conversation request', async () => {
      const validRequest = {
        title: 'Test Conversation',
        model: 'gpt-3.5-turbo',
        systemPrompt: 'You are a helpful assistant.',
      };

      const response = await llmClient.post('/api/v1/conversations', validRequest);

      expect(response.status).toBe(201);
      expect(response.data).toMatchObject({
        id: expect.any(String),
        title: validRequest.title,
        model: validRequest.model,
        systemPrompt: validRequest.systemPrompt,
        createdAt: expect.any(String),
      });
    });

    test('should use default values when optional fields missing', async () => {
      const minimalRequest = {
        model: 'gpt-3.5-turbo',
      };

      const response = await llmClient.post('/api/v1/conversations', minimalRequest);

      expect(response.status).toBe(201);
      expect(response.data).toMatchObject({
        id: expect.any(String),
        model: minimalRequest.model,
      });
    });
  });

  describe('POST /api/v1/conversations/:id/messages', () => {
    test('should accept valid message', async () => {
      const conversation = await llmClient.post('/api/v1/conversations', {
        model: 'gpt-3.5-turbo',
      });
      const conversationId = conversation.data.id;

      const message = {
        role: 'user',
        content: 'Hello, how are you?',
      };

      const response = await llmClient.post(
        `/api/v1/conversations/${conversationId}/messages`,
        message
      );

      expect(response.status).toBe(201);
      expect(response.data).toMatchObject({
        id: expect.any(String),
        role: 'user',
        content: message.content,
        createdAt: expect.any(String),
      });
    });

    test('should reject invalid role', async () => {
      const conversation = await llmClient.post('/api/v1/conversations', {
        model: 'gpt-3.5-turbo',
      });
      const conversationId = conversation.data.id;

      const invalidMessage = {
        role: 'invalid',
        content: 'Test',
      };

      await expect(
        llmClient.post(`/api/v1/conversations/${conversationId}/messages`, invalidMessage)
      ).rejects.toMatchObject({
        response: { status: 400 },
      });
    });
  });

  describe('GET /api/v1/conversations/:id', () => {
    test('should return conversation with messages', async () => {
      const conversation = await llmClient.post('/api/v1/conversations', {
        model: 'gpt-3.5-turbo',
      });
      const conversationId = conversation.data.id;

      const response = await llmClient.get(`/api/v1/conversations/${conversationId}`);

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        id: conversationId,
        model: expect.any(String),
        messages: expect.any(Array),
        createdAt: expect.any(String),
      });
    });
  });
});
