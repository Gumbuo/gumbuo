async function main() {
  const hre = require("hardhat");
  const Presale = await hre.ethers.getContractFactory("GumbuoPresale");
  const presale = await Presale.deploy();
  await presale.deployed();
  console.log("GumbuoPresale deployed to:", presale.address);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
