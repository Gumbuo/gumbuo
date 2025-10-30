const hre = require("hardhat");

async function main() {
  console.log("🔄 Updating Gumbuo Fighter NFT Base URI...\n");

  // Your deployed NFT contract address
  const NFT_ADDRESS = process.env.NEXT_PUBLIC_GUMBUO_FIGHTER_NFT || "0x03772362A12686eC103b6B413299D04DEbfb77Af";
  
  // REPLACE THIS with your IPFS CID after uploading
  const NEW_BASE_URI = "ipfs://bafybeid7kru6e3jrwnbcxslwz73co37zp6fwhbn5qdp6n3rbgzfr2j42jy/";
  
  console.log("📍 NFT Contract:", NFT_ADDRESS);
  console.log("🔗 New Base URI:", NEW_BASE_URI);
  
  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("👤 Updating from:", signer.address);
  console.log("💰 Balance:", hre.ethers.utils.formatEther(await signer.getBalance()), "ETH\n");

  // Get contract instance
  const nft = await hre.ethers.getContractAt("GumbuoFighterNFT", NFT_ADDRESS);

  // Check current owner
  const owner = await nft.owner();
  console.log("🔐 Contract owner:", owner);
  
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    console.error("❌ ERROR: You are not the contract owner!");
    console.error("   Contract owner:", owner);
    console.error("   Your address:", signer.address);
    process.exit(1);
  }

  // Update base URI
  console.log("\n⏳ Submitting transaction...");
  const tx = await nft.setBaseURI(NEW_BASE_URI);
  console.log("📝 Transaction hash:", tx.hash);
  
  console.log("⏳ Waiting for confirmation...");
  await tx.wait();
  
  console.log("\n✅ Base URI updated successfully!");
  console.log("\n🎉 Your NFTs will now use metadata from:", NEW_BASE_URI);
  console.log("\n📋 Example token URIs:");
  console.log("   Token 0:", NEW_BASE_URI + "nyx.json");
  console.log("   Token 1:", NEW_BASE_URI + "zorb.json");
  console.log("   Token 2:", NEW_BASE_URI + "baob.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
