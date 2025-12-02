# AI_SMARTLITE

AI platform with microservices architecture for speech recognition, text-to-speech, and language processing.

## Project Structure

```text
AI_SMARTLITE/
│
├── apps/                         # All applications and services
│   ├── gateway/                  # API Gateway service
│   ├── asr-service/              # Automatic Speech Recognition service
│   ├── tts-service/              # Text-to-Speech service
│   ├── llm-service/              # Large Language Model service
│   └── pipeline-service/         # Pipeline orchestration service
│
├── infra/                        # Infrastructure as Code (IaC)
│   ├── docker/                   # Docker configurations
│   ├── kubernetes/               # K8s manifests
│   └── terraform/                # Terraform scripts
│
├── schemas/                      # Shared schemas and contracts
│   ├── api/                      # API schemas
│   └── events/                   # Event schemas
│
├── tests/                        # Integration and E2E tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # End-to-end tests
│
├── ci/                           # CI/CD configurations
│   ├── github/                   # GitHub Actions
│   └── scripts/                  # Build and deployment scripts
│
└── docs/                         # Documentation
    ├── api/                      # API documentation
    ├── architecture/             # Architecture diagrams
    └── guides/                   # User guides
```

## Service Structure

Each service follows a clean architecture pattern:

```text
service/
│
├── api/                          # API layer
│   ├── handlers/                 # HTTP/gRPC handlers
│   └── middlewares/              # Service-specific middleware
│
├── core/                         # Core business logic
│   ├── models/                   # Domain models
│   ├── services/                 # Business logic services
│   └── repositories/             # Repository interfaces
│
├── infrastructure/               # Infrastructure layer
│   ├── db/                       # Database implementations
│   └── external/                 # External service clients
│
├── config/                       # Configuration management
├── schemas/                      # Request/response schemas
└── utils/                        # Utility functions
```
