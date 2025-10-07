const { Wallet } = require("ethers");
const fs = require("fs");

const tx = JSON.parse(fs.readFileSync("tx.json", "utf8"));
const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const wallet = new Wallet(privateKey);
wallet.signTransaction(tx).then(signed => {
  fs.writeFileSync("signedTx.txt", signed);
  console.log("✅ Transaction signed");
});
