const { ethers } = require("ethers");

const baseMainnet = { name: "base", chainId: 8453 };
const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org", baseMainnet);
const wallet = new ethers.Wallet("0xd10d48e92478c9073bd78127822431fe87b9bf70400139030827b17c256871ad", provider);

const presaleAddress = "0x5dc25A61056635dadb9B9840A2a83F2E4ca5eB95";
const abi = [ "function buy() payable external" ];

(async () => {
  const presale = new ethers.Contract(presaleAddress, abi, wallet);
  const tx = await presale.buy({
    value: ethers.utils.parseEther("0.001"),
    gasLimit: 250000
  });
  const receipt = await tx.wait();

  if (receipt.status === 1) {
    console.log("✅ Buy successful:", receipt.transactionHash);
  } else {
    console.error("❌ Buy failed");
  }
})();
