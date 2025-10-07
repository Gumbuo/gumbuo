param (
    [string]$wallet
)

$path = ".\public\wallets\$wallet.json"
if (Test-Path $path) {
    $data = Get-Content $path | ConvertFrom-Json
    if ($data.eligible -eq $true) {
        $data.eligible = $false
        $data.last_updated = (Get-Date).ToString("o")
        $data.points += 100
        $data | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath $path
        Write-Host "? Rewards claimed for $wallet"
    } else {
        Write-Host "?? Wallet not eligible: $wallet"
    }
} else {
    Write-Host "? Wallet not found: $wallet"
}
