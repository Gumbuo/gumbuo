const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider({
  url: "https://mainnet.base.org",
  name: "base",
  chainId: 8453
});

const privateKey = "0x8e775cd81405724a17b63e6a1e5874d51ad87e49f44a68a84c303dbb2bdaca43";
const wallet = new ethers.Wallet(privateKey, provider);

async function forceWithdraw() {
  const tx = await wallet.sendTransaction({
    to: "0x00798Fea2FD199dEE180281a0d0304c9a0954c35",
    data: "0x3ccfd60b", // raw calldata for withdraw()
    gasLimit: 50000,
    gasPrice: ethers.BigNumber.from("4000000000")
  });

  console.log("Forced withdraw sent:", tx.hash);
}

forceWithdraw().catch(console.error);
