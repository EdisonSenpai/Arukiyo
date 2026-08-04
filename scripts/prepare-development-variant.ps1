$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

$env:APP_VARIANT = "development"

Write-Host ""
Write-Host "Preparing Arukiyo Dev..." `
    -ForegroundColor Cyan
Write-Host (
    "Android package: " +
    "com.eduarddonea.arukiyo.dev"
)
Write-Host ""

npx expo prebuild --clean --platform android

powershell `
    -ExecutionPolicy Bypass `
    -File ".\scripts\fix-gradle-jvm.ps1"

Write-Host ""
Write-Host (
    "Native project prepared. Install with:"
) -ForegroundColor Green
Write-Host "npx expo run:android --device"
