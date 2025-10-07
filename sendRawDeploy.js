const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
const wallet = new ethers.Wallet("0x8e775cd81405724a17b63e6a1e5874d51ad87e49f44a68a84c303dbb2bdaca43", provider);

const bytecode = "";

(async () => {
  const nonce = await wallet.getTransactionCount();
  const tx = {
    nonce,
    gasLimit: ethers.BigNumber.from("1200000"),
    maxFeePerGas: ethers.BigNumber.from("2000000000"),
    maxPriorityFeePerGas: ethers.BigNumber.from("1000000000"),
    data: bytecode,
    chainId: 8453,
    type: 2
  };
  const signedTx = await wallet.signTransaction(tx);
  const txResponse = await provider.sendTransaction(signedTx);
  console.log("? Raw deploy sent:", txResponse.hash);
})();
