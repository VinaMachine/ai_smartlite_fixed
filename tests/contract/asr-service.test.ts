import { describe, test, expect } from '@jest/globals';
import { asrClient } from '../shared/client';

describe('Contract: ASR Service API', () => {
    describe('POST /api/v1/transcribe', () => {
        test('should accept valid transcription request', async () => {
            const validRequest = {
                audioUrl: 'https://example.com/audio.wav',
                language: 'en',
            };

            const response = await asrClient.post('/api/v1/transcribe', validRequest);

            expect(response.status).toBe(201);
            expect(response.data).toMatchObject({
                id: expect.any(String),
                audioUrl: validRequest.audioUrl,
                language: validRequest.language,
                status: expect.stringMatching(/^(pending|processing)$/),
                createdAt: expect.any(String),
            });
        });

        test('should reject request without audioUrl', async () => {
            const invalidRequest = {
                language: 'en',
            };

            await expect(asrClient.post('/api/v1/transcribe', invalidRequest))
                .rejects.toMatchObject({
                    response: {
                        status: 400,
                        data: expect.objectContaining({
                            error: expect.any(String),
                        }),
                    },
                });
        });

        test('should use default language if not provided', async () => {
            const request = {
                audioUrl: 'https://example.com/audio.wav',
            };

            const response = await asrClient.post('/api/v1/transcribe', request);

            expect(response.status).toBe(201);
            expect(response.data.language).toBe('en'); // Default
        });
    });

    describe('GET /api/v1/transcribe/:id', () => {
        test('should return transcription with correct schema', async () => {
            const createResponse = await asrClient.post('/api/v1/transcribe', {
                audioUrl: 'https://example.com/audio.wav',
                language: 'en',
            });
            const transcriptionId = createResponse.data.id;

            const response = await asrClient.get(`/api/v1/transcribe/${transcriptionId}`);

            expect(response.status).toBe(200);
            expect(response.data).toMatchObject({
                id: transcriptionId,
                audioUrl: expect.any(String),
                language: expect.any(String),
                status: expect.stringMatching(/^(pending|processing|completed|failed)$/),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });
        });

        test('should return 404 for non-existent id', async () => {
            await expect(asrClient.get('/api/v1/transcribe/non-existent'))
                .rejects.toMatchObject({
                    response: {
                        status: 404,
                        data: expect.objectContaining({
                            error: expect.any(String),
                        }),
                    },
                });
        });
    });
});
