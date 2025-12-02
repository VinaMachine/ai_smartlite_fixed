import axios, { AxiosInstance } from 'axios';
import { config } from './config';

export class TestClient {
    private client: AxiosInstance;

    constructor(baseURL: string) {
        this.client = axios.create({
            baseURL,
            timeout: config.TEST_TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async get(path: string, params?: any) {
        return this.client.get(path, { params });
    }

    async post(path: string, data?: any) {
        return this.client.post(path, data);
    }

    async put(path: string, data?: any) {
        return this.client.put(path, data);
    }

    async delete(path: string) {
        return this.client.delete(path);
    }

    setAuthToken(token: string) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    clearAuthToken() {
        delete this.client.defaults.headers.common['Authorization'];
    }
}

export const gatewayClient = new TestClient(config.GATEWAY_URL);
export const asrClient = new TestClient(config.ASR_SERVICE_URL);
export const ttsClient = new TestClient(config.TTS_SERVICE_URL);
export const llmClient = new TestClient(config.LLM_SERVICE_URL);
export const pipelineClient = new TestClient(config.PIPELINE_SERVICE_URL);
