#!/bin/bash
# Generate SBOM for all services
# Complies with TRD v2.2 SBOM requirements

set -e

OUTPUT_DIR="./sbom-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_DIR="$OUTPUT_DIR/$TIMESTAMP"

mkdir -p "$REPORT_DIR"

echo "Generating SBOM reports..."
echo "Output directory: $REPORT_DIR"

# List of services
SERVICES=(
    "gateway"
    "input-handler"
    "preprocessor"
    "asr-service"
    "text-cleaner"
    "llm-service"
    "semantic-formatter"
    "tts-service"
    "audio-post"
    "encoder"
    "delivery"
)

# Generate SBOM for each service
for service in "${SERVICES[@]}"; do
    echo "Generating SBOM for $service..."
    
    docker run --rm \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v "$REPORT_DIR:/output" \
        anchore/syft:latest \
        "ai-smartlite-$service:latest" \
        -o json="/output/${service}-sbom.json" \
        -o spdx="/output/${service}-sbom.spdx"
    
    echo "✅ SBOM generated for $service"
done

# Generate summary report
echo "Generating summary report..."
cat > "$REPORT_DIR/summary.md" << EOF
# SBOM Summary Report
Generated: $(date)

## Services Scanned
EOF

for service in "${SERVICES[@]}"; do
    echo "- $service" >> "$REPORT_DIR/summary.md"
done

echo ""
echo "✅ SBOM generation complete!"
echo "Reports saved to: $REPORT_DIR"
