const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
const wallet = new ethers.Wallet("0x8e775cd81405724a17b63e6a1e5874d51ad87e49f44a68a84c303dbb2bdaca43", provider);

const gmbTokenAddress = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";
const presaleAddress = "0x5dc25A61056635dadb9B9840A2a83F2E4ca5eB95";

const abi = [
  "function approve(address spender, uint256 amount) external returns (bool)"
];

(async () => {
  const gmb = new ethers.Contract(gmbTokenAddress, abi, wallet);
  const tx = await gmb.approve(presaleAddress, ethers.constants.MaxUint256);
  const receipt = await tx.wait();

  if (receipt.status === 1) {
    console.log("✅ GMB approval successful");
  } else {
    console.error("❌ GMB approval failed");
  }
})();
