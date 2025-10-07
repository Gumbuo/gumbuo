require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

const abi = JSON.parse(fs.readFileSync("./src/abis/GumbuoPresale.json")).abi;
const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";
const contract = new ethers.Contract(contractAddress, abi, wallet);

async function setRate() {
  const rate = ethers.utils.parseUnits("500000", 18); // 500,000 GMB per ETH
  const tx = await contract.setRate(rate);
  await tx.wait();
  console.log("✅ Presale rate set to 500,000 GMB per ETH");
}

setRate();
