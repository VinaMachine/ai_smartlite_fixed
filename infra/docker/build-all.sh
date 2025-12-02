#!/bin/bash

# Build all Docker images
echo "Building Docker images..."

# Build Gateway
echo "Building Gateway..."
docker build -t ai-smartlite/gateway:latest ./apps/gateway

# Build ASR Service
echo "Building ASR Service..."
docker build -t ai-smartlite/asr-service:latest ./apps/asr-service

# Build TTS Service
echo "Building TTS Service..."
docker build -t ai-smartlite/tts-service:latest ./apps/tts-service

# Build LLM Service
echo "Building LLM Service..."
docker build -t ai-smartlite/llm-service:latest ./apps/llm-service

# Build Pipeline Service
echo "Building Pipeline Service..."
docker build -t ai-smartlite/pipeline-service:latest ./apps/pipeline-service

echo "All images built successfully"
