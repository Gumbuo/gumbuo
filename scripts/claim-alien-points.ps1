$wallets = @("0xABC123...", "0xDEF456...", "0xGHI789...")

foreach ($wallet in $wallets) {
  $record = Invoke-RestMethod -Uri "http://localhost:54321/rest/v1/staking_pool?wallet=eq.$wallet" `
    -Method GET `
    -Headers @{
      "apikey" = "sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz"
      "Content-Type" = "application/json"
    }

  if ($record.Count -eq 0) {
    Write-Host "Wallet $wallet not found in staking_pool."
    continue
  }

  $lastClaim = [datetime]::Parse($record[0].last_claim)
  $now = Get-Date
  $minutesElapsed = ($now - $lastClaim).TotalMinutes
  $pointsEarned = [math]::Floor($minutesElapsed * 1)

  $updateBody = @{
    last_claim = $now.ToString("o")
    total_claimed = $record[0].total_claimed + $pointsEarned
  } | ConvertTo-Json -Compress

  Invoke-RestMethod -Uri "http://localhost:54321/rest/v1/staking_pool?wallet=eq.$wallet" `
    -Method PATCH `
    -Headers @{
      "apikey" = "sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz"
      "Content-Type" = "application/json"
    } `
    -Body $updateBody

  Write-Host "Wallet $wallet claimed $pointsEarned alien points."
}
