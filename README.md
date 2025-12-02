# AI SmartLite

Enterprise-grade microservices architecture for AI-powered audio processing with full TRD v2.2 compliance.

## Architecture

### Microservices (A-J Pipeline)
- **Gateway**: API Gateway with Express Gateway + control-plane hooks
- **Input Handler**: A-step - Audio/text input processing
- **Preprocessor**: B-step - Audio preprocessing
- **ASR Service**: C-step - Automatic Speech Recognition
- **Text Cleaner**: D-step - Text normalization
- **LLM Service**: E-step - Language model processing
- **Semantic Formatter**: F-step - Semantic formatting
- **TTS Service**: G-step - Text-to-Speech synthesis
- **Audio Post**: H-step - Audio post-processing
- **Encoder**: I-step - Audio encoding
- **Delivery**: J-step - WebRTC delivery with TURN/STUN

### Observability Stack
- **Prometheus**: Metrics collection and monitoring
- **Grafana**: Visualization and dashboards
- **Loki**: Log aggregation with 1-year retention

### Security & Compliance
- **Vault**: Secret management with 30-day rotation
- **mTLS**: Service-to-service encryption
- **Audit Logs**: 1-year retention as per TRD v2.2
- **SBOM**: Software Bill of Materials generation

### Chaos Engineering
- **Chaos Mesh**: Chaos testing framework
- **Chaos Controller**: Automated chaos scenarios

### Registry Mirrors
- US East (port 5001)
- EU West (port 5002)
- Asia Southeast (port 5003)

## Quick Start

### Prerequisites
- Docker & Docker Compose
- OpenSSL (for certificate generation)
- 16GB+ RAM recommended

### Setup

1. **Clone and configure**
```bash
cd ai_smartlite_new
cp .env.example .env
# Edit .env with your configuration
```

2. **Generate TLS certificates**
```bash
bash scripts/generate_certs.sh
```

3. **Start services**
```bash
docker-compose up -d
```

4. **Verify health**
```bash
bash scripts/check_runtime_health.sh
```

5. **Generate SBOM**
```bash
bash scripts/generate_sbom.sh
```

### Access Points
- Gateway: http://localhost:8080
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)
- Vault: http://localhost:8200

## TRD v2.2 Compliance

✅ **Issue #1**: Observability stack (Prometheus + structured logs)
✅ **Issue #2**: Policy rules hot reload (mounted at `/app/policy_rules`)
✅ **Issue #3**: Secret rotation (30-day interval) + SBOM generation
✅ **Issue #4**: TLS/mTLS layer for service-to-service communication
✅ **Issue #5**: TURN/STUN servers configured for WebRTC
✅ **Issue #6**: Chaos test container with automated scenarios
✅ **Issue #7**: Audit log retention (1 year) with dedicated volume
✅ **Issue #8**: Multi-region registry mirrors (US/EU/Asia)
✅ **Issue #9**: JWT rotation policy (24-hour interval)
✅ **Issue #10**: Health checks for all services

## Configuration

### Policy Rules
Edit policy rules in `config/policy_rules/`:
- `rate_limit.json`: Rate limiting configuration
- `circuit_breaker.json`: Circuit breaker settings

Hot reload enabled - changes apply within 30 seconds.

### Secret Rotation
Configure rotation in `config/secret-rotation/rotation-policy.json`:
- JWT keys: 24 hours
- Database credentials: 30 days
- TLS certificates: 30 days (with 30-day renewal warning)

### WebRTC Configuration
Edit TURN/STUN servers in `config/webrtc/ice-servers.json`

## Monitoring

### Prometheus Metrics
All services expose `/metrics` endpoint with:
- Request latency histograms
- Error rates
- Concurrent connections
- Resource utilization

### Grafana Dashboards
Pre-configured dashboards for:
- Service health overview
- Pipeline performance (A-J steps)
- Resource usage
- Error tracking

### Log Retention
- Audit logs: 1 year (as per TRD v2.2)
- Application logs: 30 days
- Structured JSON format with trace IDs

## Chaos Testing

### Manual Chaos Scenarios
```bash
# Network packet loss (25%)
docker exec chaos-controller python chaos_controller.py run network-packet-loss

# Pod failure
docker exec chaos-controller python chaos_controller.py run pod-failure

# Network delay (100ms)
docker exec chaos-controller python chaos_controller.py run network-delay
```

### Automated Chaos Schedule
- Network delay: Every 2 hours
- Pod failure: Every 4 hours

## Development

### Adding New Services
1. Create service directory in `apps/`
2. Add to `docker-compose.yml` with health check
3. Update gateway routing in `apps/gateway/gateway.config.yml`
4. Add Prometheus scrape config
5. Generate service certificate

### Testing
```bash
# Unit tests
docker-compose run --rm gateway npm test

# Integration tests
bash tests/integration/run_tests.sh

# Streaming tests
bash tests/streaming/run_tests.sh
```

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
