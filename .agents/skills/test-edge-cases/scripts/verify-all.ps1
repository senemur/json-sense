# PowerShell script to execute the complete verification pipeline for JsonSense
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Running JsonSense Edge Verification   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[1/4] Running ESLint..." -ForegroundColor Yellow
npm run lint

Write-Host "`n[2/4] Running TypeScript Compilation Check..." -ForegroundColor Yellow
npx tsc -b

Write-Host "`n[3/4] Running Complete Vitest Test Suite..." -ForegroundColor Yellow
npm test

Write-Host "`n[4/4] Running Production Build..." -ForegroundColor Yellow
npm run build

# Clean dist if generated
if (Test-Path "dist") {
    Remove-Item -Recurse -Force dist
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host " All Quality Checks Passed Successfully! " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
