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
const abi = contractData.abi;
const bytecode = contractData.evm.bytecode.object;

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
const wallet = new ethers.Wallet("0x8e775cd81405724a17b63e6a1e5874d51ad87e49f44a68a84c303dbb2bdaca43", provider);

(async () => {
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy(
    "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0",
    "0x7FC5205E6DE02e524Bf154Cc9406613262fc7c5b",
    {
      gasLimit: 250000,
      maxFeePerGas: ethers.BigNumber.from("2000000000"),
      maxPriorityFeePerGas: ethers.BigNumber.from("1000000000")
    }
  );
  await contract.deployed();
  console.log("✅ GumbuoPresale deployed at:", contract.address);
})();
