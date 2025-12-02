#!/bin/bash
set -e

echo "Building all service images..."

SERVICES=("gateway" "asr-service" "tts-service" "llm-service" "pipeline-service")
REGISTRY="${REGISTRY:-ghcr.io}"
IMAGE_PREFIX="${IMAGE_PREFIX:-ai-smartlite}"
TAG="${TAG:-latest}"

for service in "${SERVICES[@]}"; do
    echo "Building $service..."
    docker build \
        -t "${REGISTRY}/${IMAGE_PREFIX}-${service}:${TAG}" \
        -t "${REGISTRY}/${IMAGE_PREFIX}-${service}:latest" \
        --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
        --build-arg VCS_REF="$(git rev-parse --short HEAD)" \
        --build-arg VERSION="${TAG}" \
        "./apps/${service}"
    
    echo "✓ $service built successfully"
done

echo "All images built successfully!"
