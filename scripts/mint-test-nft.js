const hre = require("hardhat");

async function main() {
  console.log("🎮 Minting test Gumbuo Fighter NFT...\n");

  const NFT_ADDRESS = "0x03772362A12686eC103b6B413299D04DEbfb77Af";
  const MINT_FEE = "0.0000001";
  const ALIEN_TYPE = "nyx"; // Shadow Walker!

  const [signer] = await hre.ethers.getSigners();
  console.log("👤 Minting to:", signer.address);
  console.log("💰 Balance:", hre.ethers.utils.formatEther(await signer.getBalance()), "ETH\n");

  const nft = await hre.ethers.getContractAt("GumbuoFighterNFT", NFT_ADDRESS);

  console.log("🎲 Minting", ALIEN_TYPE, "fighter...");
  const tx = await nft.mintFighter(ALIEN_TYPE, { 
    value: hre.ethers.utils.parseEther(MINT_FEE) 
  });
  
  console.log("📝 Transaction:", tx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  const receipt = await tx.wait();
  console.log("✅ Minted successfully!\n");

  // Get token ID from event
  const event = receipt.events?.find(e => e.event === 'FighterMinted');
  const tokenId = event?.args?.tokenId.toString();

  console.log("🎉 NFT Details:");
  console.log("   Token ID:", tokenId);
  console.log("   Type:", ALIEN_TYPE);
  console.log("   Owner:", signer.address);
  
  // Get token URI
  const tokenURI = await nft.tokenURI(tokenId);
  console.log("   Metadata URI:", tokenURI);
  
  console.log("\n🔍 View on explorer:");
  console.log("   https://explorer.testnet.abs.xyz/tx/" + tx.hash);
  
  console.log("\n🌐 View metadata:");
  console.log("   https://ipfs.io/ipfs/bafybeid7kru6e3jrwnbcxslwz73co37zp6fwhbn5qdp6n3rbgzfr2j42jy/nyx.json");
  
  console.log("\n👁️ Check your balance:");
  const balance = await nft.balanceOf(signer.address);
  console.log("   You now own", balance.toString(), "Gumbuo Fighter(s)!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
