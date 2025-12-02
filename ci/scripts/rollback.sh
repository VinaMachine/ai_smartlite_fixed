#!/bin/bash
set -e

# Rollback script
ENVIRONMENT="${1:-staging}"
NAMESPACE="${ENVIRONMENT}"

echo "Rolling back $ENVIRONMENT environment..."

# Confirm rollback
read -p "Are you sure you want to rollback $ENVIRONMENT? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled"
    exit 0
fi

# Rollback deployments
echo "Rolling back deployments..."
SERVICES=("gateway" "asr-service" "tts-service" "llm-service" "pipeline-service")

for service in "${SERVICES[@]}"; do
    echo "Rolling back $service..."
    kubectl rollout undo "deployment/${service}" \
        --namespace="${NAMESPACE}"
done

# Wait for rollback
echo "Waiting for rollback to complete..."
for service in "${SERVICES[@]}"; do
    kubectl rollout status "deployment/${service}" \
        --namespace="${NAMESPACE}" \
        --timeout=10m
done

# Verify health
echo "Verifying service health..."
if [ "$ENVIRONMENT" == "production" ]; then
    ./ci/scripts/health-check.sh "https://ai-smartlite.com"
else
    ./ci/scripts/health-check.sh "https://staging.ai-smartlite.com"
fi

echo "Rollback completed successfully!"
