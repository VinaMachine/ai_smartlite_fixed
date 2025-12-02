# Run test suite
param(
    [switch]$E2E = $false,
    [int]$CoverageThreshold = 80
)

$ErrorActionPreference = "Stop"

Write-Host "Running test suite..." -ForegroundColor Green

# Change to tests directory
Set-Location tests

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing test dependencies..." -ForegroundColor Yellow
    npm ci
}

# Run linting
Write-Host "`nRunning linters..." -ForegroundColor Yellow
npm run lint --if-present 2>$null

# Run integration tests
Write-Host "`nRunning integration tests..." -ForegroundColor Yellow
npm run test:integration

# Run contract tests
Write-Host "`nRunning contract tests..." -ForegroundColor Yellow
npm run test:contract

# Run E2E tests if flag is set
if ($E2E) {
    Write-Host "`nRunning E2E tests..." -ForegroundColor Yellow
    npm run test:e2e
}

# Generate coverage report
Write-Host "`nGenerating coverage report..." -ForegroundColor Yellow
npm run test:coverage

# Check coverage threshold
$coverageFile = "coverage/coverage-summary.json"
if (Test-Path $coverageFile) {
    $coverage = (Get-Content $coverageFile | ConvertFrom-Json).total.lines.pct
    
    if ($coverage -lt $CoverageThreshold) {
        Write-Host "✗ Coverage $coverage% is below threshold $CoverageThreshold%" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "✓ Coverage $coverage% meets threshold $CoverageThreshold%" -ForegroundColor Green
    }
}

Write-Host "`nAll tests passed!" -ForegroundColor Green
