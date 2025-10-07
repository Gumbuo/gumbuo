$sourcePath = ".\contracts\GumbuoPresale.sol"
$inputJson = @{
  language = "Solidity"
  sources = @{
    "GumbuoPresale.sol" = @{
      content = Get-Content $sourcePath -Raw
    }
  }
  settings = @{
    outputSelection = @{
      "*" = @{
        "*" = @("abi", "evm.bytecode", "evm.deployedBytecode")
      }
    }
  }
} | ConvertTo-Json -Depth 10

$solcPath = ".\node_modules\solc\soljson.js"
$compiled = node -e "const solc = require('$solcPath'); console.log(solc.compile(process.argv[1]))" "$inputJson"

Set-Content .\artifacts\GumbuoPresale.json $compiled
