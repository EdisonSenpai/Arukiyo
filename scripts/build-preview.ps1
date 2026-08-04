$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host ""
Write-Host "Arukiyo Preview standalone build" `
    -ForegroundColor Cyan
Write-Host (
    "Package: " +
    "com.eduarddonea.arukiyo.preview"
)
Write-Host (
    "This APK runs without Metro."
)
Write-Host ""

npx eas-cli@latest build `
    --platform android `
    --profile preview
