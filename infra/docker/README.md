# Docker Infrastructure

Docker setup for AI_SMARTLITE microservices platform.

## Quick Start

### 1. Development (DB & Redis only)
```bash
# Start only database and redis
docker-compose -f docker-compose.dev.yml up -d

# Stop
docker-compose -f docker-compose.dev.yml down
```

### 2. Full Stack
```bash
# Copy environment file
cp .env.docker.example .env.docker

# Edit .env.docker with your configuration
# nano .env.docker

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Build Images

### Windows (PowerShell)
```powershell
.\infra\docker\build-all.ps1
```

### Linux/Mac
```bash
chmod +x infra/docker/build-all.sh
./infra/docker/build-all.sh
```

## Service URLs

- **Gateway**: http://localhost:8080
- **ASR Service**: http://localhost:8001
- **TTS Service**: http://localhost:8002
- **LLM Service**: http://localhost:8003
- **Pipeline Service**: http://localhost:8004
- **MySQL**: localhost:3306
- **Redis**: localhost:6379

## Useful Commands

```bash
# View running containers
docker-compose ps

# View logs for specific service
docker-compose logs -f asr-service

# Rebuild specific service
docker-compose up -d --build asr-service

# Execute command in container
docker-compose exec asr-service bash

# View resource usage
docker stats

# Clean up everything
docker-compose down -v
docker system prune -a
```

## Production Deployment

### Build for production
```bash
docker-compose -f docker-compose.yml build --no-cache
```

### Push to registry
```bash
docker tag ai-smartlite/gateway:latest registry.example.com/ai-smartlite/gateway:latest
docker push registry.example.com/ai-smartlite/gateway:latest
```

## Troubleshooting

### Check service health
```bash
docker-compose ps
```

### View service logs
```bash
docker-compose logs -f [service-name]
```

### Restart service
```bash
docker-compose restart [service-name]
```

### Clear volumes
```bash
docker-compose down -v
```
