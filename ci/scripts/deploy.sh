#!/bin/bash
set -e

# Deployment script
ENVIRONMENT="${1:-staging}"
VERSION="${2:-latest}"
NAMESPACE="${ENVIRONMENT}"

echo "Deploying version $VERSION to $ENVIRONMENT..."

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    echo "Error: Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

# Confirmation for production
if [ "$ENVIRONMENT" == "production" ]; then
    read -p "Are you sure you want to deploy to PRODUCTION? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Deployment cancelled"
        exit 0
    fi
fi

# Apply Kubernetes manifests
echo "Applying Kubernetes manifests..."
kubectl apply -f "infra/kubernetes/${ENVIRONMENT}/" --namespace="${NAMESPACE}"

# Update image tags
echo "Updating image tags to $VERSION..."
SERVICES=("gateway" "asr-service" "tts-service" "llm-service" "pipeline-service")

for service in "${SERVICES[@]}"; do
    kubectl set image "deployment/${service}" \
        "${service}=ghcr.io/ai-smartlite-${service}:${VERSION}" \
        --namespace="${NAMESPACE}" \
        --record
done

# Wait for rollout
echo "Waiting for deployments to complete..."
for service in "${SERVICES[@]}"; do
    kubectl rollout status "deployment/${service}" \
        --namespace="${NAMESPACE}" \
        --timeout=10m
done

# Run health checks
echo "Running health checks..."
if [ "$ENVIRONMENT" == "production" ]; then
    ./ci/scripts/health-check.sh "https://ai-smartlite.com"
else
    ./ci/scripts/health-check.sh "https://staging.ai-smartlite.com"
fi

echo "Deployment completed successfully!"
