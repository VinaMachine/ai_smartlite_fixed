#!/bin/bash
set -e

# Health check script for services
BASE_URL="${1:-http://localhost:8080}"
MAX_RETRIES="${2:-30}"
RETRY_DELAY="${3:-5}"

echo "Checking service health at $BASE_URL"

SERVICES=(
    "/health:Gateway"
    "/asr/health:ASR Service"
    "/tts/health:TTS Service"
    "/llm/health:LLM Service"
    "/pipeline/health:Pipeline Service"
)

check_endpoint() {
    local endpoint=$1
    local name=$2
    local retry=0
    
    echo "Checking $name..."
    
    while [ $retry -lt $MAX_RETRIES ]; do
        if curl -sf "${BASE_URL}${endpoint}" > /dev/null 2>&1; then
            echo "✓ $name is healthy"
            return 0
        fi
        
        retry=$((retry + 1))
        echo "  Retry $retry/$MAX_RETRIES..."
        sleep $RETRY_DELAY
    done
    
    echo "✗ $name health check failed"
    return 1
}

failed=0

for service in "${SERVICES[@]}"; do
    IFS=':' read -r endpoint name <<< "$service"
    if ! check_endpoint "$endpoint" "$name"; then
        failed=$((failed + 1))
    fi
done

if [ $failed -gt 0 ]; then
    echo "Health check failed for $failed service(s)"
    exit 1
fi

echo "All services are healthy!"
exit 0
