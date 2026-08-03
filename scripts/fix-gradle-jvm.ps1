$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$androidRoot = Join-Path $projectRoot "android"
$gradleDirectory = Join-Path $androidRoot "gradle"
$criteriaFile = Join-Path $gradleDirectory "gradle-daemon-jvm.properties"

if (-not (Test-Path $androidRoot)) {
    throw "Folderul android nu există. Rulează mai întâi expo prebuild."
}

New-Item -ItemType Directory -Path $gradleDirectory -Force |
    Out-Null

Set-Content -Path $criteriaFile -Value "toolchainVersion=17"

Write-Host "Gradle Daemon JVM fixat pe Java 17:" -ForegroundColor Green
Write-Host $criteriaFile
