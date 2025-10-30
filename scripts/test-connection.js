const hre = require("hardhat");

async function main() {
  console.log("Testing connection to Abstract testnet...\n");

  try {
    const signers = await hre.ethers.getSigners();
    console.log("Signers found:", signers.length);

    if (signers.length > 0) {
      const deployer = signers[0];
      console.log("✅ Deployer address:", deployer.address);

      const balance = await deployer.getBalance();
      console.log("💰 Balance:", hre.ethers.utils.formatEther(balance), "ETH");

      const network = await hre.ethers.provider.getNetwork();
      console.log("🌐 Network:", network.name, "Chain ID:", network.chainId);
    } else {
      console.log("❌ No signers found. Check PRIVATE_KEY in .env");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
