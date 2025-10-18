const { Wallet } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load private key securely
const keyPath = "C:/Secrets/gumbuo.key";
if (!fs.existsSync(keyPath)) {
  console.error("❌ Private key file not found");
  process.exit(1);
}
const privateKey = fs.readFileSync(keyPath, "utf8").trim();

// Load transaction JSON from argument
const txPath = process.argv[2];
if (!txPath || !fs.existsSync(txPath)) {
  console.error("❌ Transaction file not found");
  process.exit(1);
}
const tx = JSON.parse(fs.readFileSync(txPath, "utf8"));

// Sign and output
const wallet = new Wallet(privateKey);
wallet.signTransaction(tx).then(signed => {
  console.log(signed); // PowerShell captures this
}).catch(err => {
  console.error("❌ Signing failed:", err.message);
  process.exit(1);
});
