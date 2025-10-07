const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Paths
const txPath = path.join(__dirname, "tx.json");
const outPath = path.join(__dirname, "signedTx.hex");

// Load transaction
const tx = JSON.parse(fs.readFileSync(txPath, "utf8"));

// Private key (Hardhat Account #0)
const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const wallet = new ethers.Wallet(privateKey);

// Build legacy transaction
(async () => {
  const legacyTx = {
    nonce: ethers.BigNumber.from(tx.nonce).toNumber(),
    to: tx.to,
    value: ethers.BigNumber.from(tx.value),
    gasLimit: ethers.BigNumber.from(tx.gasLimit || "21000"),
    gasPrice: ethers.BigNumber.from(tx.gasPrice || tx.maxFeePerGas || "1000000000"),
    chainId: tx.chainId || 31337
  };

  const signedTx = await wallet.signTransaction(legacyTx);
  fs.writeFileSync(outPath, signedTx);
  console.log("✅ signedTx.hex written");
})();
