$records = Invoke-RestMethod -Uri "http://localhost:54321/rest/v1/staking_pool?select=wallet,total_claimed" `
  -Method GET `
  -Headers @{
    "apikey" = "sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz"
    "Content-Type" = "application/json"
  }

$sorted = $records | Sort-Object -Property total_claimed -Descending
$sorted | ConvertTo-Json -Depth 3 | Set-Content ".\public\leaderboard.json"
