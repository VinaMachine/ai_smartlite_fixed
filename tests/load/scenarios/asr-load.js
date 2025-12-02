import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 100 }, // Spike to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate should be less than 10%
    errors: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.ASR_SERVICE_URL || 'http://localhost:8001';

export default function () {
  // Test health endpoint
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check has status field': (r) => JSON.parse(r.body).status !== undefined,
  }) || errorRate.add(1);

  sleep(1);

  // Test transcription creation
  const transcriptionPayload = JSON.stringify({
    audioUrl: 'https://example.com/audio.wav',
    language: 'en',
  });

  const transcriptionRes = http.post(`${BASE_URL}/api/v1/transcribe`, transcriptionPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(transcriptionRes, {
    'transcription created successfully': (r) => r.status === 201,
    'transcription has id': (r) => JSON.parse(r.body).id !== undefined,
  }) || errorRate.add(1);

  sleep(2);
}

export function handleSummary(data) {
  return {
    'load/results/asr-summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
