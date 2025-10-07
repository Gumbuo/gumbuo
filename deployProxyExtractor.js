const fs = require("fs");
const solc = require("solc");
const { ethers } = require("ethers");

const source = fs.readFileSync(process.env.USERPROFILE + "/gumbuo-site/ProxyExtractor.sol", "utf8");

const input = {
  language: "Solidity",
  sources: {
    "ProxyExtractor.sol": { content: source }
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
const contractData = output.contracts["ProxyExtractor.sol"]["ProxyExtractor"];
const abi = contractData.abi;
const bytecode = contractData.evm.bytecode.object;

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
const wallet = new ethers.Wallet("0x8e775cd81405724a17b63e6a1e5874d51ad87e49f44a68a84c303dbb2bdaca43", provider);

async function deploy() {
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.deployed();
  console.log("ProxyExtractor deployed at:", contract.address);
}

deploy().catch(console.error);
