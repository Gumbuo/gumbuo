const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider({
  url: "https://mainnet.base.org",
  name: "base",
  chainId: 8453
});

const privateKey = "0x8e775cd81405724a17b63e6a1e5874d51ad87e49f44a68a84c303dbb2bdaca43";
const wallet = new ethers.Wallet(privateKey, provider);

const presaleAddress = "0x102078D1b5222562d76E63414c764fC7deedA4E0"; // ✅ GMB Presale
const presaleAbi = ["function buy() payable"];
const contract = new ethers.Contract(presaleAddress, presaleAbi, wallet);

async function sendBuyTx() {
  const tx = await contract.buy({
    value: ethers.utils.parseEther("0.001"),
    gasLimit: 30000,
    gasPrice: ethers.BigNumber.from("4000000000")
  });

  console.log("Buy transaction sent:", tx.hash);
}

sendBuyTx().catch(console.error);
