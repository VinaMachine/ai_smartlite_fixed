# Docker Deployment Guide

Deploy AI_SMARTLITE using Docker and Docker Compose for local development and testing.

## Prerequisites

- Docker 24.0+ installed
- Docker Compose V2 installed
- 8GB RAM minimum (16GB recommended)
- 20GB free disk space

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/VinaChat/AI_SMARTLITE.git
cd AI_SMARTLITE
```

### 2. Environment Configuration

Create `.env` file in the root directory:

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Database
DB_HOST=mysql
DB_PORT=3306
DB_NAME=ai_smartlite
DB_USER=smartlite_user
DB_PASSWORD=SecurePassword123!
DB_ROOT_PASSWORD=RootPassword456!

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h

# API Keys (External Services)
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key

# Gateway
GATEWAY_PORT=8080

# Service Ports
ASR_SERVICE_PORT=8001
TTS_SERVICE_PORT=8002
LLM_SERVICE_PORT=8003
PIPELINE_SERVICE_PORT=8004

# Environment
NODE_ENV=development
PYTHON_ENV=development
```

### 3. Start Services

**Start all services:**

```bash
docker-compose up -d
```

**Start specific services:**

```bash
# Start only database and cache
docker-compose up -d mysql redis

# Start specific microservices
docker-compose up -d gateway asr-service llm-service
```

### 4. Verify Deployment

**Check service status:**

```bash
docker-compose ps
```

**Expected output:**
```
NAME                STATUS              PORTS
gateway             Up (healthy)        0.0.0.0:8080->8080/tcp
asr-service         Up (healthy)        0.0.0.0:8001->8000/tcp
tts-service         Up (healthy)        0.0.0.0:8002->8000/tcp
llm-service         Up (healthy)        0.0.0.0:8003->8000/tcp
pipeline-service    Up (healthy)        0.0.0.0:8004->8000/tcp
mysql               Up                  0.0.0.0:3306->3306/tcp
redis               Up                  0.0.0.0:6379->6379/tcp
```

**Health check:**

```bash
curl http://localhost:8080/health
```

**View logs:**

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f gateway
docker-compose logs -f asr-service
```

## Docker Compose Configuration

### docker-compose.yml

The main configuration file orchestrates all services:

```yaml
version: '3.8'

services:
  # API Gateway
  gateway:
    build:
      context: ./apps/gateway
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=${NODE_ENV}
      - DB_HOST=${DB_HOST}
      - REDIS_HOST=${REDIS_HOST}
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ASR Service
  asr-service:
    build:
      context: ./apps/asr-service
      dockerfile: Dockerfile
    ports:
      - "8001:8000"
    environment:
      - PYTHON_ENV=${PYTHON_ENV}
    volumes:
      - asr-models:/app/models
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  # Add other services...
```

### Development Override

Create `docker-compose.override.yml` for development:

```yaml
version: '3.8'

services:
  gateway:
    volumes:
      - ./apps/gateway/src:/app/src
    command: npm run dev

  asr-service:
    volumes:
      - ./services/asr-service:/app
    command: uvicorn main:app --host 0.0.0.0 --reload
```

## Service Configuration

### Gateway

```dockerfile
# apps/gateway/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app .

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "dist/index.js"]
```

### Python Services (ASR, TTS, LLM, Pipeline)

```dockerfile
# Example: services/asr-service/Dockerfile
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

FROM python:3.11-slim

WORKDIR /app

# Copy from builder
COPY --from=builder /app .
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Database Setup

### Initialize Database

The database is automatically initialized on first start.

**Manual initialization:**

```bash
# Run migrations
docker-compose exec gateway npm run migrate

# Or from schemas directory
cd schemas
npm run migrate
```

**Seed database:**

```bash
docker-compose exec gateway npm run seed
```

### Database Access

**Connect to MySQL:**

```bash
docker-compose exec mysql mysql -u smartlite_user -p ai_smartlite
```

**Run MySQL commands:**

```bash
docker-compose exec mysql mysql -u root -p${DB_ROOT_PASSWORD} -e "SHOW DATABASES;"
```

### Backup Database

```bash
# Backup
docker-compose exec mysql mysqldump \
  -u root -p${DB_ROOT_PASSWORD} ai_smartlite > backup.sql

# Restore
docker-compose exec -T mysql mysql \
  -u root -p${DB_ROOT_PASSWORD} ai_smartlite < backup.sql
```

## Volume Management

### Persistent Volumes

```yaml
volumes:
  mysql-data:
    driver: local
  redis-data:
    driver: local
  asr-models:
    driver: local
  tts-models:
    driver: local
  llm-cache:
    driver: local
  uploads:
    driver: local
```

### Backup Volumes

```bash
# Backup volume
docker run --rm \
  -v ai_smartlite_mysql-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mysql-backup.tar.gz /data

# Restore volume
docker run --rm \
  -v ai_smartlite_mysql-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/mysql-backup.tar.gz -C /
```

## Resource Management

### Resource Limits

```yaml
services:
  asr-service:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G

  llm-service:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
```

### GPU Support

**Enable GPU for ML services:**

```yaml
services:
  asr-service:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

**Prerequisites:**
- NVIDIA GPU
- NVIDIA Docker runtime installed
- `nvidia-docker2` package

## Networking

### Custom Network

```yaml
networks:
  ai-smartlite:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

### Service Communication

Services communicate via service names:

```javascript
// Gateway connecting to services
const asrServiceUrl = 'http://asr-service:8000';
const ttsServiceUrl = 'http://tts-service:8000';
const llmServiceUrl = 'http://llm-service:8000';
```

## Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service with timestamps
docker-compose logs -f --timestamps gateway

# Last 100 lines
docker-compose logs --tail=100 asr-service

# Save logs to file
docker-compose logs > logs.txt
```

### Container Stats

```bash
# Real-time stats
docker stats

# Specific containers
docker stats gateway asr-service tts-service
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Rebuild service
docker-compose up -d --build <service-name>

# Remove and recreate
docker-compose rm -f <service-name>
docker-compose up -d <service-name>
```

### Port Conflicts

```bash
# Check port usage
netstat -tulpn | grep <port>

# Change port in .env or docker-compose.yml
GATEWAY_PORT=8081
```

### Database Connection Issues

```bash
# Check MySQL is running
docker-compose ps mysql

# Test connection
docker-compose exec mysql mysql -u root -p -e "SELECT 1"

# Reset database
docker-compose down -v
docker-compose up -d
```

### Out of Memory

```bash
# Increase Docker memory limit (Docker Desktop)
# Settings > Resources > Memory

# Or reduce service limits in docker-compose.yml
```

### Disk Space

```bash
# Check disk usage
docker system df

# Clean up
docker system prune -a --volumes

# Remove unused images
docker image prune -a

# Remove stopped containers
docker container prune
```

## Maintenance

### Update Services

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build

# Or specific service
docker-compose up -d --build gateway
```

### Clean Up

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: data loss)
docker-compose down -v

# Remove all containers, networks, volumes
docker-compose down -v --remove-orphans
```

## Development Workflow

### Local Development

```bash
# Start dependencies only
docker-compose -f docker-compose.dev.yml up -d

# Run services locally
cd apps/gateway
npm run dev

cd services/asr-service
python -m uvicorn main:app --reload
```

### Hot Reload

Use volume mounts for hot reload:

```yaml
services:
  gateway:
    volumes:
      - ./apps/gateway:/app
      - /app/node_modules
    command: npm run dev
```

### Debugging

```yaml
services:
  gateway:
    command: npm run debug
    ports:
      - "9229:9229"  # Node.js debugger
```

## Production Considerations

For production deployments:

1. **Use production images** - Remove dev dependencies
2. **Set resource limits** - Prevent resource exhaustion
3. **Enable health checks** - Automatic recovery
4. **Use secrets** - Secure credential management
5. **Enable logging** - Centralized log collection
6. **Backup strategy** - Regular automated backups
7. **Monitoring** - Prometheus + Grafana
8. **SSL/TLS** - Use reverse proxy (Nginx/Traefik)

See [Kubernetes Deployment](./kubernetes.md) for production-grade orchestration.

## Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose stop

# Restart service
docker-compose restart <service-name>

# View logs
docker-compose logs -f

# Execute command in container
docker-compose exec <service-name> <command>

# Scale service
docker-compose up -d --scale asr-service=3

# Remove everything
docker-compose down -v --remove-orphans
```

## Next Steps

- [Production Deployment](./production.md)
- [Kubernetes Setup](./kubernetes.md)
- [Monitoring Guide](./monitoring.md)
- [Backup Strategy](./backup.md)
