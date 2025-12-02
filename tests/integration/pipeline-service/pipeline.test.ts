import { describe, test, expect, beforeEach } from '@jest/globals';
import { pipelineClient } from '../../shared/client';
import { fixtures } from '../../shared/fixtures';
import { db } from '../../shared/database';

describe('Pipeline Service Integration Tests', () => {
  beforeEach(async () => {
    await db.cleanup(['pipelines', 'pipeline_executions']);
  });

  describe('Health Check', () => {
    test('should return healthy status', async () => {
      const response = await pipelineClient.get('/health');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'healthy');
    });
  });

  describe('Pipeline API', () => {
    test('should create pipeline', async () => {
      const pipelineData = fixtures.pipeline.valid();
      
      const response = await pipelineClient.post('/api/v1/pipelines', pipelineData);
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('name', pipelineData.name);
      expect(response.data).toHaveProperty('status', 'active');
    });

    test('should execute pipeline', async () => {
      const pipeline = await pipelineClient.post('/api/v1/pipelines',
        fixtures.pipeline.valid());
      const pipelineId = pipeline.data.id;

      const executionData = {
        inputData: { text: 'Test input' },
      };

      const response = await pipelineClient.post(
        `/api/v1/pipelines/${pipelineId}/execute`,
        executionData
      );

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('status', 'pending');
    });

    test('should get pipeline execution status', async () => {
      const pipeline = await pipelineClient.post('/api/v1/pipelines',
        fixtures.pipeline.valid());
      const pipelineId = pipeline.data.id;

      const execution = await pipelineClient.post(
        `/api/v1/pipelines/${pipelineId}/execute`,
        { inputData: {} }
      );
      const executionId = execution.data.id;

      const response = await pipelineClient.get(
        `/api/v1/executions/${executionId}`
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', executionId);
      expect(response.data).toHaveProperty('status');
    });

    test('should list user pipelines', async () => {
      await pipelineClient.post('/api/v1/pipelines', fixtures.pipeline.valid());
      await pipelineClient.post('/api/v1/pipelines', fixtures.pipeline.valid());

      const response = await pipelineClient.get('/api/v1/pipelines');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.pipelines)).toBe(true);
      expect(response.data.pipelines.length).toBeGreaterThanOrEqual(2);
    });
  });
});
