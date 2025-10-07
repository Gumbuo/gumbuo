const fs = require("fs");
const solc = require("solc");
const { ethers } = require("ethers");

const source = fs.readFileSync(process.env.USERPROFILE + "/gumbuo-site/GumbuoPresale.sol", "utf8");

const input = {
  language: "Solidity",
  sources: {
    "GumbuoPresale.sol": { content: source }
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"]
      }
    }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contractData = output.contracts["GumbuoPresale.sol"]["GumbuoPresale"];
const bytecode = contractData.evm.bytecode.object;

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");

(async () => {
  const tx = {
    from: "0x7FC5205E6DE02e524Bf154Cc9406613262fc7c5b",
    data: "0x" + bytecode + ethers.utils.defaultAbiCoder.encode(
      ["address", "address"],
      ["0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0", "0x7FC5205E6DE02e524Bf154Cc9406613262fc7c5b"]
    ).slice(2)
  };

  try {
    const result = await provider.call(tx);
    console.log("✅ Simulation passed. Ready to deploy.");
  } catch (err) {
    console.error("❌ Simulation failed:", err.reason || err.message);
  }
})();
