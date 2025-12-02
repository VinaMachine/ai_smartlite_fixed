#!/bin/bash
# Generate TLS certificates for mTLS
# Issue #4: TLS/mTLS layer

set -e

CERT_DIR="./certs"
CA_DIR="$CERT_DIR/ca"
SERVICES_DIR="$CERT_DIR/services"

mkdir -p "$CA_DIR" "$SERVICES_DIR"

echo "Generating TLS certificates for mTLS..."

# Generate CA
echo "1. Generating Certificate Authority..."
openssl genrsa -out "$CA_DIR/ca-key.pem" 4096

openssl req -new -x509 -days 365 -key "$CA_DIR/ca-key.pem" \
    -out "$CA_DIR/ca-cert.pem" \
    -subj "/C=US/ST=CA/L=SF/O=AISmartLite/CN=AISmartLite-CA"

echo "✅ CA generated"

# Services list
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

# Generate certificates for each service
for service in "${SERVICES[@]}"; do
    echo "2. Generating certificate for $service..."
    
    # Generate private key
    openssl genrsa -out "$SERVICES_DIR/${service}-key.pem" 2048
    
    # Generate CSR
    openssl req -new -key "$SERVICES_DIR/${service}-key.pem" \
        -out "$SERVICES_DIR/${service}-csr.pem" \
        -subj "/C=US/ST=CA/L=SF/O=AISmartLite/CN=${service}"
    
    # Sign certificate with CA
    openssl x509 -req -in "$SERVICES_DIR/${service}-csr.pem" \
        -CA "$CA_DIR/ca-cert.pem" \
        -CAkey "$CA_DIR/ca-key.pem" \
        -CAcreateserial \
        -out "$SERVICES_DIR/${service}-cert.pem" \
        -days 365
    
    # Clean up CSR
    rm "$SERVICES_DIR/${service}-csr.pem"
    
    echo "✅ Certificate generated for $service"
done

echo ""
echo "✅ All certificates generated successfully!"
echo "CA certificate: $CA_DIR/ca-cert.pem"
echo "Service certificates: $SERVICES_DIR/"
