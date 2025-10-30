const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Gumbuo Arena contracts to Abstract...\n");

  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying from:", deployer.address);
  console.log("💰 Balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

  // Step 1: Deploy NFT Contract
  console.log("1️⃣  Deploying GumbuoFighterNFT...");

  const baseURI = "ipfs://QmYourIPFSHash/"; // TODO: Update with real IPFS hash

  const NFT = await hre.ethers.getContractFactory("GumbuoFighterNFT");
  const nft = await NFT.deploy(baseURI);
  await nft.deployed();

  console.log("✅ GumbuoFighterNFT deployed to:", nft.address);
  console.log("   Base URI:", baseURI, "\n");

  // Step 2: Deploy Arena Contract
  console.log("2️⃣  Deploying GumbuoArena...");

  const Arena = await hre.ethers.getContractFactory("GumbuoArena");
  const arena = await Arena.deploy(nft.address);
  await arena.deployed();

  console.log("✅ GumbuoArena deployed to:", arena.address);
  console.log("   NFT Contract:", nft.address, "\n");

  // Step 3: Link contracts
  console.log("3️⃣  Linking contracts...");

  const tx = await nft.setArenaContract(arena.address);
  await tx.wait();

  console.log("✅ Arena authorized to burn NFTs\n");

  // Summary
  console.log("=" .repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(60));
  console.log("NFT Contract:   ", nft.address);
  console.log("Arena Contract: ", arena.address);
  console.log("\n📝 Next steps:");
  console.log("1. Update .env.local with contract addresses");
  console.log("2. Upload alien metadata to IPFS");
  console.log("3. Update baseURI: nft.setBaseURI('ipfs://...')");
  console.log("4. Verify contracts on explorer");
  console.log("\n🔍 Verification commands:");
  console.log(`npx hardhat verify --network abstractTestnet ${nft.address} "${baseURI}"`);
  console.log(`npx hardhat verify --network abstractTestnet ${arena.address} ${nft.address}`);
  console.log("=" .repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
