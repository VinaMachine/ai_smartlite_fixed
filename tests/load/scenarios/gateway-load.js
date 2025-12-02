import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.05'],
  },
};

const GATEWAY_URL = __ENV.GATEWAY_URL || 'http://localhost:8080';

export default function () {
  // Test gateway routing to different services
  const services = [
    { path: '/asr/health', name: 'ASR' },
    { path: '/tts/health', name: 'TTS' },
    { path: '/llm/health', name: 'LLM' },
    { path: '/pipeline/health', name: 'Pipeline' },
  ];

  services.forEach((service) => {
    const res = http.get(`${GATEWAY_URL}${service.path}`);
    check(res, {
      [`${service.name} health check OK`]: (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  sleep(1);
}
