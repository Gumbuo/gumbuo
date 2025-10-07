const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider({
  url: "https://mainnet.base.org",
  chainId: 8453,
  name: "base"
});

const presaleAddress = "0x5dc25a61056635dadb9b9840a2a83f2e4ca5eb95";
const abi = [
  "function owner() view returns (address)",
  "function initialized() view returns (bool)"
];

(async () => {
  const contract = new ethers.Contract(presaleAddress, abi, provider);
  const owner = await contract.owner();
  const isInitialized = await contract.initialized();
  console.log("👤 Owner:", owner);
  console.log("🔒 Initialized:", isInitialized);
})();
