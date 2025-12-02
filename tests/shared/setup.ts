import { db, redis } from './database';

beforeAll(async () => {
  console.log('Setting up test environment...');
  await db.connect();
  await redis.connect();
});

afterAll(async () => {
  console.log('Cleaning up test environment...');
  await db.close();
  await redis.close();
});

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
