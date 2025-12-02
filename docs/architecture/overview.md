# System Architecture Overview

AI_SMARTLITE is a microservices-based platform providing AI-powered services including Automatic Speech Recognition (ASR), Text-to-Speech (TTS), and Large Language Model (LLM) capabilities.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Apps                          │
│                    (Web, Mobile, Desktop)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       API Gateway                            │
│                  (Routing, Auth, Rate Limiting)              │
└────┬──────────┬─────────────┬──────────────┬────────────────┘
     │          │             │              │
     ▼          ▼             ▼              ▼
┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐
│   ASR   │ │   TTS   │ │   LLM    │ │   Pipeline   │
│ Service │ │ Service │ │ Service  │ │   Service    │
└────┬────┘ └────┬────┘ └────┬─────┘ └───────┬──────┘
     │           │            │               │
     └───────────┴────────────┴───────────────┘
                         │
                         ▼
          ┌──────────────────────────┐
          │   Shared Infrastructure   │
          │  - MySQL Database         │
          │  - Redis Cache            │
          │  - Object Storage         │
          └──────────────────────────┘
```

## Core Components

### 1. API Gateway
- **Technology**: Express.js / Express Gateway
- **Responsibilities**:
  - Request routing to microservices
  - Authentication & authorization
  - Rate limiting & throttling
  - Request/response transformation
  - CORS handling
  - API versioning

### 2. ASR Service (Automatic Speech Recognition)
- **Technology**: Python 3.11 + FastAPI
- **Responsibilities**:
  - Audio file transcription
  - Real-time speech recognition
  - Multi-language support
  - Audio preprocessing
- **Key Libraries**: Whisper, librosa, pydub

### 3. TTS Service (Text-to-Speech)
- **Technology**: Python 3.11 + FastAPI
- **Responsibilities**:
  - Text-to-speech synthesis
  - Voice selection
  - Multiple language/accent support
  - Audio format conversion
- **Key Libraries**: gTTS, pyttsx3, Coqui TTS

### 4. LLM Service (Large Language Model)
- **Technology**: Python 3.11 + FastAPI
- **Responsibilities**:
  - Natural language processing
  - Conversation management
  - Text generation
  - Prompt engineering
- **Key Libraries**: OpenAI API, LangChain, Transformers

### 5. Pipeline Service
- **Technology**: Python 3.11 + FastAPI
- **Responsibilities**:
  - Multi-service workflow orchestration
  - Pipeline configuration management
  - Execution tracking
  - Error handling & retries

## Data Flow

### Example: Voice Assistant Pipeline

```
1. User speaks → Audio File
        ↓
2. ASR Service → Transcribed Text
        ↓
3. LLM Service → AI Response
        ↓
4. TTS Service → Audio Response
        ↓
5. User hears response
```

## Infrastructure Components

### Database Layer
- **MySQL 8.0**: Primary data store
  - User accounts & sessions
  - Service requests & history
  - Pipeline configurations
  - Usage metrics

### Caching Layer
- **Redis**: In-memory cache
  - Session storage
  - API rate limiting
  - Temporary results
  - Queue management

### Storage Layer
- **Object Storage** (S3/MinIO)
  - Audio files
  - Generated outputs
  - Model artifacts

## Communication Patterns

### Synchronous Communication
- **REST APIs**: Client ↔ Services
- **HTTP/HTTPS**: Gateway ↔ Microservices

### Asynchronous Communication
- **Message Queue** (Future): Service-to-service events
- **WebSockets** (Future): Real-time updates

## Scalability

### Horizontal Scaling
- Each microservice can be scaled independently
- Load balancing via Kubernetes/Docker Swarm
- Auto-scaling based on CPU/memory metrics

### Vertical Scaling
- Resource allocation per service
- GPU allocation for ML models
- Memory tuning for cache layers

## Security Architecture

### Authentication
- JWT-based authentication
- OAuth 2.0 support
- API key authentication

### Authorization
- Role-based access control (RBAC)
- Service-level permissions
- Resource-level policies

### Data Security
- TLS/SSL encryption in transit
- Database encryption at rest
- Secret management (environment variables)

## High Availability

### Redundancy
- Multiple replicas per service
- Database replication
- Cache failover

### Health Checks
- Liveness probes
- Readiness probes
- Service monitoring

### Disaster Recovery
- Automated backups
- Point-in-time recovery
- Rollback procedures

## Performance Considerations

### Response Times
- Gateway: < 50ms
- ASR Service: 2-5s (depends on audio length)
- TTS Service: 1-3s
- LLM Service: 1-5s (depends on model)
- Pipeline Service: 5-15s (combined)

### Throughput
- Gateway: 10K req/s
- Services: 100-1000 req/s per instance
- Database: 50K queries/s
- Cache: 100K ops/s

## Technology Stack Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| API Gateway | Node.js + Express | 20.x |
| Python Services | Python + FastAPI | 3.11 |
| Database | MySQL | 8.0 |
| Cache | Redis | 7.x |
| Container Runtime | Docker | 24.x |
| Orchestration | Kubernetes | 1.28+ |
| CI/CD | GitHub Actions | - |
| Monitoring | Prometheus + Grafana | Latest |

## Design Principles

1. **Microservices Architecture**: Independent, loosely-coupled services
2. **API-First Design**: Well-defined REST APIs
3. **Scalability**: Horizontal and vertical scaling support
4. **Resilience**: Fault tolerance and graceful degradation
5. **Security**: Defense in depth
6. **Observability**: Comprehensive logging and monitoring
7. **DevOps**: Automated CI/CD pipelines

## Future Enhancements

- [ ] Service mesh (Istio/Linkerd)
- [ ] Event-driven architecture (Kafka)
- [ ] GraphQL API layer
- [ ] Real-time streaming
- [ ] Model serving optimization
- [ ] Multi-region deployment
