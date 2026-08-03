$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "Arukiyo Stage 2B - instalare dependințe" -ForegroundColor Cyan

npx expo install expo-sqlite
npx expo install @maplibre/maplibre-react-native
npm install h3-js@^4.5.0

node .\scripts\configure-stage2b.mjs

Write-Host ""
Write-Host "Dependințele Stage 2B au fost instalate." -ForegroundColor Green
Write-Host ""
Write-Host "Rulează în continuare:" -ForegroundColor Yellow
Write-Host "npx expo prebuild --clean --platform android"
Write-Host "powershell -ExecutionPolicy Bypass -File .\scripts\fix-gradle-jvm.ps1"
Write-Host "npx expo run:android --device"
