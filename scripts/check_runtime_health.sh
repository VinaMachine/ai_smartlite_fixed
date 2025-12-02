#!/bin/bash
# Check runtime health of all services

set -e

SERVICES=(
    "gateway:8080"
    "input-handler:8081"
    "preprocessor:8082"
    "asr-service:8083"
    "text-cleaner:8084"
    "llm-service:8085"
    "semantic-formatter:8086"
    "tts-service:8087"
    "audio-post:8088"
    "encoder:8089"
    "delivery:8090"
)

echo "Checking runtime health of all services..."
echo "=========================================="

all_healthy=true

for service_info in "${SERVICES[@]}"; do
    IFS=':' read -r service port <<< "$service_info"
    
    echo -n "Checking $service... "
    
    if curl -sf "http://localhost:$port/health" > /dev/null 2>&1; then
        echo "✅ Healthy"
    else
        echo "❌ Unhealthy or unreachable"
        all_healthy=false
    fi
done

echo "=========================================="

if [ "$all_healthy" = true ]; then
    echo "✅ All services are healthy!"
    exit 0
else
    echo "❌ Some services are unhealthy!"
    exit 1
fi
