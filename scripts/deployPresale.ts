import { ethers } from "ethers";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const artifact = JSON.parse(fs.readFileSync("./artifacts/GumbuoPresale.json", "utf8"));
  const abi = artifact.contracts["GumbuoPresale.sol"]["GumbuoPresale"].abi;
  const bytecode = artifact.contracts["GumbuoPresale.sol"]["GumbuoPresale"].evm.bytecode.object;

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  const gmbTokenAddress = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";
  const contract = await factory.deploy(gmbTokenAddress, {
    gasLimit: 300000,
    maxFeePerGas: ethers.BigNumber.from("4000000000"),
    maxPriorityFeePerGas: ethers.BigNumber.from("4000000000")
  });

  await contract.deployed();
  console.log("✅ GumbuoPresale deployed at:", contract.address);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
});
