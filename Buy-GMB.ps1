param (
  [decimal]$ethAmount
)

# Config
$rpcUrl = "http://127.0.0.1:8545"
$fromAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
$toAddress = "0x7FC5205E6DE02e524Bf154Cc9406613262fc7c5b"
$chainId = 31337
$gasLimit = 21000
$gasPrice = 1000000000  # 1 Gwei

# Convert ETH to Wei
$weiAmount = [math]::Round($ethAmount * [math]::Pow(10, 18))

# Fetch nonce
$noncePayload = @{
  jsonrpc = "2.0"
  method  = "eth_getTransactionCount"
  params  = @($fromAddress, "latest")
  id      = 1
}
$nonceHex = (Invoke-RestMethod -Uri $rpcUrl -Method Post -Body ($noncePayload | ConvertTo-Json -Depth 10)).result
$nonce = [Convert]::ToInt32($nonceHex, 16)

# Build transaction object
$tx = @{
  nonce = $nonce
  to = $toAddress
  value = $weiAmount
  gasLimit = $gasLimit
  gasPrice = $gasPrice
  chainId = $chainId
}

# Save transaction to file
$tx | ConvertTo-Json -Depth 10 | Set-Content "tx.json"

# Run Node.js signer
Start-Process "node" "signTx.js" -Wait

# Read signed transaction
$signedTx = (Get-Content "signedTx.hex") -join ""

# Broadcast transaction
$sendPayload = @{
  jsonrpc = "2.0"
  method = "eth_sendRawTransaction"
  params = @($signedTx)
  id = 2
}

try {
  $response = Invoke-RestMethod -Uri $rpcUrl -Method Post -Body ($sendPayload | ConvertTo-Json -Depth 10)
  Write-Host "✅ Transaction sent: $($response.result)"
} catch {
  Write-Host "❌ RPC error: $($_.Exception.Message)"
}
