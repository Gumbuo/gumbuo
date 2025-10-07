$walletDir = ".\public\wallets"
$leaderboard = @()

Get-ChildItem $walletDir -Filter *.json | ForEach-Object {
    $data = Get-Content $_.FullName | ConvertFrom-Json
    $leaderboard += [PSCustomObject]@{
        wallet = $data.wallet
        points = $data.points
    }
}

$leaderboard = $leaderboard | Sort-Object -Property points -Descending
$leaderboard | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath ".\public\leaderboard.json"
Write-Host "?? Leaderboard updated"
