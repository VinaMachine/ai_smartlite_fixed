# Build all Docker images
Write-Host "Building Docker images..." -ForegroundColor Green

# Build Gateway
Write-Host "Building Gateway..." -ForegroundColor Yellow
docker build -t ai-smartlite/gateway:latest ./apps/gateway

# Build ASR Service
Write-Host "Building ASR Service..." -ForegroundColor Yellow
docker build -t ai-smartlite/asr-service:latest ./apps/asr-service

# Build TTS Service
Write-Host "Building TTS Service..." -ForegroundColor Yellow
docker build -t ai-smartlite/tts-service:latest ./apps/tts-service

# Build LLM Service
Write-Host "Building LLM Service..." -ForegroundColor Yellow
docker build -t ai-smartlite/llm-service:latest ./apps/llm-service

# Build Pipeline Service
Write-Host "Building Pipeline Service..." -ForegroundColor Yellow
docker build -t ai-smartlite/pipeline-service:latest ./apps/pipeline-service

Write-Host "All images built successfully" -ForegroundColor Green
