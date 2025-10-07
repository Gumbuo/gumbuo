const fs = require("fs");
const path = require("path");
const solcWrapper = require("solc/wrapper");
const solc = solcWrapper(require("./node_modules/solc/soljson.js"));

const sourcePath = path.resolve(__dirname, "contracts", "GumbuoPresale.sol");
const source = fs.readFileSync(sourcePath, "utf8");

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
        "*": ["abi", "evm.bytecode", "evm.deployedBytecode"]
      }
    }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
fs.mkdirSync("./artifacts", { recursive: true });
fs.writeFileSync("./artifacts/GumbuoPresale.json", JSON.stringify(output, null, 2));
console.log("? GumbuoPresale compiled manually.");
