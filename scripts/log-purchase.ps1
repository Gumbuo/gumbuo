param (
    [string]$wallet,
    [int]$amount = 100
)

$path = ".\public\wallets\$wallet.json"
if (Test-Path $path) {
    $data = Get-Content $path | ConvertFrom-Json
    $data.points += $amount
    $data.eligible = $true
    $data.last_updated = (Get-Date).ToString("o")
    $data | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath $path
    Write-Host "?? Purchase logged for $wallet (+$amount points)"
} else {
    Write-Host "? Wallet not found: $wallet"
}
