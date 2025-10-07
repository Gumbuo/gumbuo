param (
    [string]$wallet
)

$path = ".\public\wallets\$wallet.json"

if ($wallet -notmatch "^0x[a-fA-F0-9]{6,}$") {
    Write-Host "⚠️ Invalid wallet format: $wallet"
    return
}

if (Test-Path $path) {
    $data = Get-Content $path | ConvertFrom-Json
    Write-Host "✅ Wallet found: $wallet"
    Write-Host "Points: $($data.points)"
    Write-Host "Eligible: $($data.eligible)"
    Write-Host "Last Updated: $($data.last_updated)"
} else {
    Write-Host "❌ Wallet not found: $wallet"
}
