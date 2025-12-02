# Load Testing with k6

Performance and load testing for AI_SMARTLITE services.

## Prerequisites

Install k6:
- **Windows**: `choco install k6`
- **Linux**: `sudo apt-get install k6`
- **macOS**: `brew install k6`

Or download from: https://k6.io/docs/getting-started/installation/

## Running Load Tests

### Single Service Tests

**ASR Service:**
```bash
k6 run load/scenarios/asr-load.js
```

**TTS Service:**
```bash
k6 run load/scenarios/tts-load.js
```

**LLM Service:**
```bash
k6 run load/scenarios/llm-load.js
```

**Gateway:**
```bash
k6 run load/scenarios/gateway-load.js
```

### With Custom Environment

```bash
k6 run -e ASR_SERVICE_URL=http://production:8001 load/scenarios/asr-load.js
```

## Test Scenarios

Each test includes:
- **Ramp-up**: Gradually increase load
- **Sustained load**: Maintain steady traffic
- **Spike test**: Sudden increase in load
- **Ramp-down**: Gradual decrease

## Thresholds

- **Response time**: p95 < 500ms (1000ms for LLM)
- **Error rate**: < 10%
- **Success rate**: > 90%

## Results

Results are saved in `load/results/` directory as JSON files.

View results:
```bash
cat load/results/asr-summary.json
```

## Cloud Testing

Run tests from k6 Cloud:
```bash
k6 cloud load/scenarios/asr-load.js
```
