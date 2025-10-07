const { task } = require("hardhat/config");

task("deploy", "Deploy GumbuoPresale contract", async (_, hre) => {
  const Presale = await hre.ethers.getContractFactory("GumbuoPresale");
  const presale = await Presale.deploy();
  await presale.deployed();
  console.log("GumbuoPresale deployed to:", presale.address);
});
