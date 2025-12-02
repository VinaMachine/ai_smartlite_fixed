import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '1m', target: 20 },
    { duration: '2m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // LLM requests can take longer
    http_req_failed: ['rate<0.1'],
    errors: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.LLM_SERVICE_URL || 'http://localhost:8003';

export default function () {
  // Create conversation
  const conversationPayload = JSON.stringify({
    title: 'Load Test Conversation',
    model: 'gpt-3.5-turbo',
    systemPrompt: 'You are a helpful assistant.',
  });

  const conversationRes = http.post(`${BASE_URL}/api/v1/conversations`, conversationPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(conversationRes, {
    'conversation created': (r) => r.status === 201,
    'conversation has id': (r) => JSON.parse(r.body).id !== undefined,
  }) || errorRate.add(1);

  if (conversationRes.status === 201) {
    const conversationId = JSON.parse(conversationRes.body).id;

    sleep(1);

    // Send message
    const messagePayload = JSON.stringify({
      role: 'user',
      content: 'Hello, this is a load test message.',
    });

    const messageRes = http.post(
      `${BASE_URL}/api/v1/conversations/${conversationId}/messages`,
      messagePayload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    check(messageRes, {
      'message sent': (r) => r.status === 201,
      'message has content': (r) => JSON.parse(r.body).content !== undefined,
    }) || errorRate.add(1);
  }

  sleep(2);
}
