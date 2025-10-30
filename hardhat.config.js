require("dotenv").config({ path: '.env.local' });
require("@nomiclabs/hardhat-ethers");

console.log("✅ hardhat.config.js loaded");

const { task } = require("hardhat/config");

// Legacy presale task
task("deploy", "Deploy GumbuoPresale contract", async (_, hre) => {
  const Presale = await hre.ethers.getContractFactory("GumbuoPresale");
  const presale = await Presale.deploy();
  await presale.deployed();
  console.log("✅ GumbuoPresale deployed to:", presale.address);
});

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Base (existing)
    base: {
      url: process.env.BASE_RPC || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8453,
    },
    // Abstract Testnet
    abstractTestnet: {
      url: process.env.ABSTRACT_TESTNET_RPC || "https://api.testnet.abs.xyz",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11124,
    },
    // Abstract Mainnet
    abstract: {
      url: process.env.ABSTRACT_MAINNET_RPC || "https://api.mainnet.abs.xyz",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 2741,
    },
    // Local development
    hardhat: {
      chainId: 1337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
