const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
const wallet = new ethers.Wallet("0x8e775cd81405724a17b63e6a1e5874d51ad87e49f44a68a84c303dbb2bdaca43", provider);

const gmbTokenAddress = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";
const buyer = "0x00798Fea2FD199dEE180281a0d0304c9a0954c35";
const amount = ethers.utils.parseUnits("100000", 18);

const abi = [
  "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)"
];

(async () => {
  const gmb = new ethers.Contract(gmbTokenAddress, abi, wallet);
  const tx = await gmb.transferFrom(wallet.address, buyer, amount);
  const receipt = await tx.wait();

  if (receipt.status === 1) {
    console.log("✅ transferFrom successful:", receipt.transactionHash);
  } else {
    console.error("❌ transferFrom failed");
  }
})();
