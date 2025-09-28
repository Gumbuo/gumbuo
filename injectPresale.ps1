$content = Get-Content .\app\page.tsx
$presaleBlock = Get-Content .\presaleBlock.txt
$fixedContent = @()
$injected = $false

foreach ($line in $content) {
  if (-not $injected -and $line -match "<h2>Gumbuo's 1st Astral Visitors Airdrop List</h2>") {
    $fixedContent += $line
    $fixedContent += $presaleBlock
    $injected = $true
    continue
  }
  $fixedContent += $line
}

Set-Content .\app\page.tsx -Value $fixedContent -Encoding UTF8
