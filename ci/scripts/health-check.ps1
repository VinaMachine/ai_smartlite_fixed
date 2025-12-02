# Health check script for services
param(
    [string]$BaseUrl = "http://localhost:8080",
    [int]$MaxRetries = 30,
    [int]$RetryDelay = 5
)

$ErrorActionPreference = "Continue"

Write-Host "Checking service health at $BaseUrl" -ForegroundColor Green

$services = @(
    @{Endpoint="/health"; Name="Gateway"},
    @{Endpoint="/asr/health"; Name="ASR Service"},
    @{Endpoint="/tts/health"; Name="TTS Service"},
    @{Endpoint="/llm/health"; Name="LLM Service"},
    @{Endpoint="/pipeline/health"; Name="Pipeline Service"}
)

function Test-Endpoint {
    param($Endpoint, $Name)
    
    Write-Host "Checking $Name..." -ForegroundColor Yellow
    
    for ($retry = 1; $retry -le $MaxRetries; $retry++) {
        try {
            $response = Invoke-WebRequest -Uri "${BaseUrl}${Endpoint}" -Method Get -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host "✓ $Name is healthy" -ForegroundColor Green
                return $true
            }
        }
        catch {
            Write-Host "  Retry $retry/$MaxRetries..." -ForegroundColor Gray
            Start-Sleep -Seconds $RetryDelay
        }
    }
    
    Write-Host "✗ $Name health check failed" -ForegroundColor Red
    return $false
}

$failed = 0

foreach ($service in $services) {
    if (-not (Test-Endpoint -Endpoint $service.Endpoint -Name $service.Name)) {
        $failed++
    }
}

if ($failed -gt 0) {
    Write-Host "`nHealth check failed for $failed service(s)" -ForegroundColor Red
    exit 1
}

Write-Host "`nAll services are healthy!" -ForegroundColor Green
exit 0
