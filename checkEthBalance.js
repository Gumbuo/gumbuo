const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider({
  url: "https://mainnet.base.org",
  name: "base",
  chainId: 8453
});

const contractAddress = "0x102078D1b5222562d76E63414c764fC7deedA4E0";
const walletAddress = "0x7FC5205E6DE02e524Bf154Cc9406613262fc7c5b";

async function checkBalances() {
  const contractBalance = await provider.getBalance(contractAddress);
  const walletBalance = await provider.getBalance(walletAddress);

  console.log("Presale Contract ETH:", ethers.utils.formatEther(contractBalance));
  console.log("Your Wallet ETH:", ethers.utils.formatEther(walletBalance));
}

checkBalances().catch(console.error);
