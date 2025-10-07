const { ethers } = require("ethers");

const provider = new ethers.providers.StaticJsonRpcProvider("https://mainnet.base.org", {
  name: "unknown",
  chainId: 8453
});

const wallet = new ethers.Wallet("0x8e775cd81405724a17b63e6a1e5874d51ad87e49f44a68a84c303dbb2bdaca43", provider);

const gmbAddress = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";
const presaleAddress = "0x..."; // Replace with your deployed Presale contract address
const gmbABI = [ "function approve(address spender, uint256 amount) public returns (bool)" ];
const gmb = new ethers.Contract(gmbAddress, gmbABI, wallet);

async function approve() {
  const amount = ethers.BigNumber.from("350000000").mul(ethers.BigNumber.from("10").pow(18));
  const tx = await gmb.approve(presaleAddress, amount);
  await tx.wait();
  console.log("✅ GMB approved for Presale contract");
}

approve().catch(console.error);
