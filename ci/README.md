# CI/CD

Continuous Integration and Continuous Deployment configurations for AI_SMARTLITE microservices platform.

## 📂 Structure

```
ci/
├── .github/workflows/     # GitHub Actions workflows
│   ├── test.yml          # Run tests on PR/push
│   ├── build.yml         # Build and push Docker images
│   ├── deploy-staging.yml
│   ├── deploy-production.yml
│   └── security-scan.yml
├── scripts/              # CI/CD automation scripts
│   ├── build-services.*  # Build all Docker images
│   ├── run-tests.*       # Execute test suite
│   ├── health-check.*    # Service health verification
│   ├── deploy.sh         # Deployment script
│   └── rollback.sh       # Rollback script
├── config/               # Quality gate configurations
│   ├── .flake8          # Python linting
│   ├── .eslintrc.json   # JavaScript linting
│   ├── pyproject.toml   # Black formatter
│   ├── sonar-project.properties
│   └── quality-gates.md
└── templates/            # CI templates for other platforms
    ├── .gitlab-ci.yml
    ├── Jenkinsfile
    └── azure-pipelines.yml
```

## 🚀 GitHub Actions Workflows

### **test.yml** - Automated Testing
Triggers on: `push`, `pull_request` to `main`, `develop`

**Jobs:**
- ✅ Lint Python services (Black, Flake8, MyPy)
- ✅ Lint Gateway (ESLint)
- ✅ Run integration tests
- ✅ Run contract tests
- ✅ Build Docker images (validation)
- ✅ Security scanning (Trivy, Safety)

**Quality Gates:**
- All linting passes
- Test coverage ≥ 80%
- No critical vulnerabilities

### **build.yml** - Build & Push Images
Triggers on: `push` to `main`, tags `v*.*.*`

**Features:**
- Multi-arch builds (amd64, arm64)
- Layer caching with GitHub Actions cache
- Automatic tagging (branch, semver, SHA)
- Push to GitHub Container Registry

### **deploy-staging.yml** - Staging Deployment
Triggers on: `push` to `develop`, `main`

### **deploy-production.yml** - Production Deployment
Triggers on: `release` published, manual workflow dispatch

**Features:**
- Pre-deployment checks
- Manual approval required
- Rolling update strategy
- Health monitoring
- Automatic rollback on failure
- Post-deployment tasks

### **security-scan.yml** - Security Scanning
Triggers on: `push`, `pull_request`, `schedule` (weekly)

**Scans:**
- Dependency vulnerabilities (Safety, npm audit)
- Container image scanning (Trivy)
- Secret detection (Gitleaks)
- SAST analysis (CodeQL)

## 🛠️ Scripts Usage

### Build All Services
**Windows:**
```powershell
.\ci\scripts\build-services.ps1 -Tag "v1.0.0"
```

**Linux/Mac:**
```bash
./ci/scripts/build-services.sh
TAG=v1.0.0 ./ci/scripts/build-services.sh
```

### Run Tests
**Windows:**
```powershell
.\ci\scripts\run-tests.ps1 -E2E
```

**Linux/Mac:**
```bash
./ci/scripts/run-tests.sh
RUN_E2E=1 ./ci/scripts/run-tests.sh
```

### Health Checks
**Windows:**
```powershell
.\ci\scripts\health-check.ps1 -BaseUrl "https://staging.ai-smartlite.com"
```

**Linux/Mac:**
```bash
./ci/scripts/health-check.sh https://ai-smartlite.com
```

### Deploy to Environment
```bash
# Deploy to staging
./ci/scripts/deploy.sh staging v1.0.0

# Deploy to production
./ci/scripts/deploy.sh production v1.0.0
```

### Rollback
```bash
# Rollback staging
./ci/scripts/rollback.sh staging

# Rollback production
./ci/scripts/rollback.sh production
```

## 📊 Quality Gates

### Coverage Requirements
- **Minimum Line Coverage**: 80%
- **Branch Coverage**: 75%
- **Critical Services**: 85%

### Code Quality
- **Max Cyclomatic Complexity**: 10
- **Max Function Length**: 50 lines
- **No code duplication** > 5%

### Security
- **Critical Vulnerabilities**: 0 allowed
- **High Vulnerabilities**: 7-day SLA
- **Secret scanning**: Mandatory

### Performance
- **Build Time**: < 10 minutes
- **Test Execution**: < 5 minutes
- **Deployment**: < 15 minutes

## 🔧 Platform Templates

### GitLab CI
Copy `ci/templates/.gitlab-ci.yml` to project root:
```bash
cp ci/templates/.gitlab-ci.yml .gitlab-ci.yml
```

### Jenkins
Use `ci/templates/Jenkinsfile`:
```bash
cp ci/templates/Jenkinsfile Jenkinsfile
```

### Azure DevOps
Use `ci/templates/azure-pipelines.yml`:
```bash
cp ci/templates/azure-pipelines.yml azure-pipelines.yml
```

## 🔐 Required Secrets

### GitHub Actions
- `GITHUB_TOKEN` - Automatic
- `AWS_ACCESS_KEY_ID` - AWS credentials
- `AWS_SECRET_ACCESS_KEY` - AWS credentials
- `AWS_REGION` - AWS region
- `SLACK_WEBHOOK` - Slack notifications
- `SAFETY_API_KEY` - Safety API key (optional)

### Kubernetes
- `KUBE_URL` - Kubernetes API URL
- `KUBE_TOKEN` - Service account token

## 🚦 Deployment Flow

### Staging (Auto-deploy)
```
develop → Build → Test → Deploy Staging → E2E Tests
```

### Production (Manual approval)
```
tag v*.*.* → Build → Test → Manual Approval → Deploy Production → Verify
```

## 📝 Best Practices

1. **Branch Protection**
   - Enable for `main` and `develop`
   - Require PR reviews (2 approvers for main)
   - Require status checks to pass

2. **Versioning**
   - Use semantic versioning (v1.2.3)
   - Tag releases properly
   - Keep changelog updated

3. **Testing**
   - Run tests locally before pushing
   - Fix failing tests immediately
   - Maintain test coverage

4. **Security**
   - Review security scan results
   - Update dependencies regularly
   - Rotate secrets periodically

5. **Monitoring**
   - Check deployment status
   - Monitor service health
   - Review CI/CD metrics

## 🆘 Troubleshooting

### Build Failures
```bash
# Check service logs
docker logs <container-id>

# Rebuild specific service
docker build -t test-build ./apps/asr-service
```

### Test Failures
```bash
# Run tests locally
cd tests
npm run test:integration -- --verbose
```

### Deployment Issues
```bash
# Check pod status
kubectl get pods -n production

# View logs
kubectl logs deployment/gateway -n production

# Rollback
./ci/scripts/rollback.sh production
```

### Health Check Failures
```bash
# Manual health check
curl https://ai-smartlite.com/health

# Check all services
./ci/scripts/health-check.sh https://ai-smartlite.com
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Deployment Strategies](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Security Scanning Tools](https://owasp.org/www-community/Source_Code_Analysis_Tools)
