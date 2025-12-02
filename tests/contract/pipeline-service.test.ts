import { describe, test, expect } from '@jest/globals';
import { pipelineClient } from '../shared/client';

describe('Contract: Pipeline Service API', () => {
  describe('POST /api/v1/pipelines', () => {
    test('should accept valid pipeline configuration', async () => {
      const validRequest = {
        name: 'Test Pipeline',
        description: 'A test pipeline',
        config: {
          steps: [
            { service: 'asr', action: 'transcribe' },
            { service: 'llm', action: 'process' },
          ],
        },
      };

      const response = await pipelineClient.post('/api/v1/pipelines', validRequest);

      expect(response.status).toBe(201);
      expect(response.data).toMatchObject({
        id: expect.any(String),
        name: validRequest.name,
        description: validRequest.description,
        status: 'active',
        createdAt: expect.any(String),
      });
    });

    test('should reject pipeline without name', async () => {
      const invalidRequest = {
        config: { steps: [] },
      };

      await expect(pipelineClient.post('/api/v1/pipelines', invalidRequest))
        .rejects.toMatchObject({
          response: { status: 400 },
        });
    });
  });

  describe('POST /api/v1/pipelines/:id/execute', () => {
    test('should accept execution request', async () => {
      const pipeline = await pipelineClient.post('/api/v1/pipelines', {
        name: 'Test',
        config: { steps: [] },
      });
      const pipelineId = pipeline.data.id;

      const executionRequest = {
        inputData: { test: 'data' },
      };

      const response = await pipelineClient.post(
        `/api/v1/pipelines/${pipelineId}/execute`,
        executionRequest
      );

      expect(response.status).toBe(201);
      expect(response.data).toMatchObject({
        id: expect.any(String),
        pipelineId: pipelineId,
        status: expect.stringMatching(/^(pending|running)$/),
        createdAt: expect.any(String),
      });
    });
  });

  describe('GET /api/v1/executions/:id', () => {
    test('should return execution status', async () => {
      const pipeline = await pipelineClient.post('/api/v1/pipelines', {
        name: 'Test',
        config: { steps: [] },
      });
      const pipelineId = pipeline.data.id;

      const execution = await pipelineClient.post(
        `/api/v1/pipelines/${pipelineId}/execute`,
        { inputData: {} }
      );
      const executionId = execution.data.id;

      const response = await pipelineClient.get(`/api/v1/executions/${executionId}`);

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        id: executionId,
        pipelineId: pipelineId,
        status: expect.stringMatching(/^(pending|running|completed|failed|cancelled)$/),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('GET /api/v1/pipelines', () => {
    test('should return list of pipelines', async () => {
      const response = await pipelineClient.get('/api/v1/pipelines');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('pipelines');
      expect(Array.isArray(response.data.pipelines)).toBe(true);
    });
  });
});
