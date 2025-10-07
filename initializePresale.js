const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider({
  url: "https://mainnet.base.org",
  chainId: 8453,
  name: "base"
});

const wallet = new ethers.Wallet("0x8e775cd81405724a17b63e6a1e5874d51ad87e49f44a68a84c303dbb2bdaca43", provider);

const presaleAddress = "0x5dc25a61056635dadb9b9840a2a83f2e4ca5eb95";
const tokenAddress = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";
const treasuryAddress = "0x7FC5205E6DE02e524Bf154Cc9406613262fc7c5b";

const abi = [ "function initialize(address _token, address _treasury) external" ];

(async () => {
  const presale = new ethers.Contract(presaleAddress, abi, wallet);
  const tx = await presale.initialize(tokenAddress, treasuryAddress);
  const receipt = await tx.wait();
  console.log(receipt.status === 1 ? "✅ Initialized" : "❌ Failed");
})();
