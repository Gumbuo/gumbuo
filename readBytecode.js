const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");

const contractAddress = "0x00798Fea2FD199dEE180281a0d0304c9a0954c35";

async function readBytecode() {
  const bytecode = await provider.getCode(contractAddress);
  console.log("Contract Bytecode:", bytecode.slice(0, 200) + "...");
}

readBytecode().catch(console.error);
