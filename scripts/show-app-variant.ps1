param(
    [ValidateSet(
        "development",
        "preview",
        "production"
    )]
    [string]$Variant = "development"
)

$ErrorActionPreference = "Stop"

$previousVariant = $env:APP_VARIANT
$env:APP_VARIANT = $Variant

try {
    Write-Host ""
    Write-Host "Arukiyo variant: $Variant" `
        -ForegroundColor Cyan
    Write-Host ""

    npx expo config --type public
}
finally {
    if ($null -eq $previousVariant) {
        Remove-Item Env:APP_VARIANT `
            -ErrorAction SilentlyContinue
    }
    else {
        $env:APP_VARIANT = $previousVariant
    }
}
