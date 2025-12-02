import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.test') });

export const config = {
    GATEWAY_URL: process.env.GATEWAY_URL || 'http://localhost:8080',
    ASR_SERVICE_URL: process.env.ASR_SERVICE_URL || 'http://localhost:8001',
    TTS_SERVICE_URL: process.env.TTS_SERVICE_URL || 'http://localhost:8002',
    LLM_SERVICE_URL: process.env.LLM_SERVICE_URL || 'http://localhost:8003',
    PIPELINE_SERVICE_URL: process.env.PIPELINE_SERVICE_URL || 'http://localhost:8004',

    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || '3306'),
    DB_USER: process.env.DB_USER || 'testuser',
    DB_PASSWORD: process.env.DB_PASSWORD || 'testpassword',
    DB_NAME: process.env.DB_NAME || 'ai_smartlite_test',

    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

    TEST_TIMEOUT: parseInt(process.env.TEST_TIMEOUT || '30000'),
    PARALLEL_TESTS: process.env.PARALLEL_TESTS === 'true',
};
