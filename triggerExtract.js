const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
const wallet = new ethers.Wallet("0x8e775cd81405724a17b63e6a1e5874d51ad87e49f44a68a84c303dbb2bdaca43", provider);

const proxyAddress = "0x87da791e2e681bD5baddbd2BaDb4F06c165245c5";
const gw3Target = "0x00798Fea2FD199dEE180281a0d0304c9a0954c35";

const abi = ["function extract(address payable target)"];
const contract = new ethers.Contract(proxyAddress, abi, wallet);

async function extract() {
  const tx = await contract.extract(gw3Target, {
    gasLimit: 100000,
    gasPrice: ethers.BigNumber.from("4000000000")
  });
  console.log("Extract trigger sent:", tx.hash);
}

extract().catch(console.error);
