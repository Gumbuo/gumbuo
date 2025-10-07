const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
const walletAddress = "YOUR_WALLET_ADDRESS"; // Replace with your address
const gmbTokenAddress = "0x..."; // Replace with GMB token contract address
const gmbAbi = ["function balanceOf(address) view returns (uint256)"];

const gmb = new ethers.Contract(gmbTokenAddress, gmbAbi, provider);

async function checkBalance() {
  const balance = await gmb.balanceOf(walletAddress);
  console.log("GMB Balance:", balance.toString());
}

checkBalance().catch(console.error);
