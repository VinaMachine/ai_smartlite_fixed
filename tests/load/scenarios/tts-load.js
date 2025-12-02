import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '2m', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.1'],
    errors: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.TTS_SERVICE_URL || 'http://localhost:8002';

export default function () {
  const ttsPayload = JSON.stringify({
    text: 'This is a load test of the text-to-speech service.',
    voice: 'en-US-Neural2-A',
    language: 'en',
  });

  const ttsRes = http.post(`${BASE_URL}/api/v1/synthesize`, ttsPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(ttsRes, {
    'TTS request created': (r) => r.status === 201,
    'TTS has id': (r) => JSON.parse(r.body).id !== undefined,
  }) || errorRate.add(1);

  sleep(2);
}
