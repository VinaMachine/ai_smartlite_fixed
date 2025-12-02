# Build all service images
param(
    [string]$Registry = "ghcr.io",
    [string]$ImagePrefix = "ai-smartlite",
    [string]$Tag = "latest"
)

$ErrorActionPreference = "Stop"

Write-Host "Building all service images..." -ForegroundColor Green

$services = @("gateway", "asr-service", "tts-service", "llm-service", "pipeline-service")
$buildDate = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
$vcsRef = git rev-parse --short HEAD

foreach ($service in $services) {
    Write-Host "`nBuilding $service..." -ForegroundColor Yellow
    
    docker build `
        -t "${Registry}/${ImagePrefix}-${service}:${Tag}" `
        -t "${Registry}/${ImagePrefix}-${service}:latest" `
        --build-arg BUILD_DATE=$buildDate `
        --build-arg VCS_REF=$vcsRef `
        --build-arg VERSION=$Tag `
        "./apps/$service"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $service built successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ $service build failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nAll images built successfully!" -ForegroundColor Green
