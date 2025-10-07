const solc = require("solc");
const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(process.env.USERPROFILE, "gumbuo-site", "GumbuoPresale.sol"), "utf8");

const input = {
  language: "Solidity",
  sources: {
    "GumbuoPresale.sol": {
      content: source
    }
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object"]
      }
    }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contract = output.contracts["GumbuoPresale.sol"]["GumbuoPresale"];
fs.writeFileSync(path.join(process.env.USERPROFILE, "gumbuo-site", "compiledBytecode.txt"), "0x" + contract.evm.bytecode.object);
console.log("✅ Bytecode written to compiledBytecode.txt");
