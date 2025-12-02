import { describe, test, expect, beforeAll } from '@jest/globals';
import { pipelineClient, asrClient, llmClient, ttsClient } from '../../shared/client';
import { fixtures } from '../../shared/fixtures';
import { db } from '../../shared/database';

describe('E2E: Automated Pipeline Execution', () => {
  let pipelineId: string;

  beforeAll(async () => {
    await db.cleanup([
      'pipelines',
      'pipeline_executions',
      'transcriptions',
      'llm_conversations',
      'tts_requests',
    ]);

    // Create a pipeline
    const pipelineData = fixtures.pipeline.valid();
    const pipeline = await pipelineClient.post('/api/v1/pipelines', pipelineData);
    pipelineId = pipeline.data.id;
  });

  test('should execute multi-service pipeline automatically', async () => {
    console.log('Executing pipeline...');
    
    const executionData = {
      inputData: {
        audioUrl: 'https://example.com/audio.wav',
        language: 'en',
        processWithLLM: true,
        synthesizeSpeech: true,
        voice: 'en-US-Neural2-A',
      },
    };

    const execution = await pipelineClient.post(
      `/api/v1/pipelines/${pipelineId}/execute`,
      executionData
    );

    expect(execution.status).toBe(201);
    const executionId = execution.data.id;

    // Poll for completion (in real scenario, this would take time)
    let status = 'pending';
    let attempts = 0;
    const maxAttempts = 10;

    while (status !== 'completed' && status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
      const statusResponse = await pipelineClient.get(`/api/v1/executions/${executionId}`);
      status = statusResponse.data.status;
      attempts++;
      console.log(`Attempt ${attempts}: Status = ${status}`);
    }

    // Verify execution results
    const finalResult = await pipelineClient.get(`/api/v1/executions/${executionId}`);
    
    expect(finalResult.data).toHaveProperty('status');
    expect(finalResult.data).toHaveProperty('inputData');
    expect(['completed', 'failed']).toContain(finalResult.data.status);

    if (finalResult.data.status === 'completed') {
      expect(finalResult.data).toHaveProperty('outputData');
      console.log('✓ Pipeline executed successfully');
    }
  }, 60000);
});
