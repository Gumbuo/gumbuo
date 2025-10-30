const { ethers } = require('hardhat');

async function main() {
  const provider = new ethers.providers.JsonRpcProvider('https://api.testnet.abs.xyz');

  const nftAddress = '0x03772362A12686eC103b6B413299D04DEbfb77Af';
  const arenaAddress = '0x08605178447b6E87bC6999c3DCf25Bf413E3277d';

  console.log('Checking NFT Contract at:', nftAddress);
  const nftCode = await provider.getCode(nftAddress);
  console.log('NFT Contract code length:', nftCode.length);
  console.log('NFT Contract exists:', nftCode !== '0x');

  console.log('\nChecking Arena Contract at:', arenaAddress);
  const arenaCode = await provider.getCode(arenaAddress);
  console.log('Arena Contract code length:', arenaCode.length);
  console.log('Arena Contract exists:', arenaCode !== '0x');

  if (nftCode === '0x') {
    console.log('\n❌ NFT CONTRACT NOT DEPLOYED!');
  }

  if (arenaCode === '0x') {
    console.log('\n❌ ARENA CONTRACT NOT DEPLOYED!');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
