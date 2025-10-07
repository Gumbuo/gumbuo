require("dotenv").config();
console.log("✅ hardhat.config.js loaded");

require("@nomiclabs/hardhat-ethers");

const { task } = require("hardhat/config");

task("deploy", "Deploy GumbuoPresale contract", async (_, hre) => {
  const Presale = await hre.ethers.getContractFactory("GumbuoPresale");
  const presale = await Presale.deploy();
  await presale.deployed();
  console.log("✅ GumbuoPresale deployed to:", presale.address);
});

module.exports = {
  solidity: "0.8.20",
  networks: {
    base: {
      url: process.env.BASE_RPC,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
