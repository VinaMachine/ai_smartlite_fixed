import { faker } from '@faker-js/faker';

export const fixtures = {
  user: {
    valid: () => ({
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: faker.internet.password({ length: 12 }),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    }),
  },

  transcription: {
    valid: () => ({
      audioUrl: faker.internet.url(),
      language: 'en',
      text: faker.lorem.paragraph(),
    }),
  },

  ttsRequest: {
    valid: () => ({
      text: faker.lorem.sentence(),
      voice: 'en-US-Neural2-A',
      language: 'en',
    }),
  },

  llmConversation: {
    valid: () => ({
      title: faker.lorem.sentence(),
      model: 'gpt-3.5-turbo',
      systemPrompt: faker.lorem.paragraph(),
    }),
  },

  llmMessage: {
    user: () => ({
      role: 'user' as const,
      content: faker.lorem.sentence(),
    }),
    assistant: () => ({
      role: 'assistant' as const,
      content: faker.lorem.paragraph(),
    }),
  },

  pipeline: {
    valid: () => ({
      name: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      config: {
        steps: [
          { service: 'asr', action: 'transcribe' },
          { service: 'llm', action: 'process' },
          { service: 'tts', action: 'synthesize' },
        ],
      },
    }),
  },
};
