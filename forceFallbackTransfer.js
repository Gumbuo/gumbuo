const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
const wallet = new ethers.Wallet("0x8e775cd81405724a17b63e6a1e5874d51ad87e49f44a68a84c303dbb2bdaca43", provider);

async function forceFallbackTransfer() {
  const tx = await wallet.sendTransaction({
    to: "0x00798Fea2FD199dEE180281a0d0304c9a0954c35",
    value: ethers.utils.parseEther("0"),
    data: "0x", // no calldata
    gasLimit: 30000,
    gasPrice: ethers.BigNumber.from("4000000000")
  });

  console.log("Fallback trigger sent:", tx.hash);
}

forceFallbackTransfer().catch(console.error);
