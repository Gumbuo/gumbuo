const { ethers } = require('hardhat');

async function main() {
  const provider = new ethers.providers.JsonRpcProvider('https://api.testnet.abs.xyz');

  const nftAddress = '0x03772362A12686eC103b6B413299D04DEbfb77Af';

  // Minimal ABI to read MINT_FEE
  const abi = [
    'function MINT_FEE() public view returns (uint256)',
    'function alienTypes(uint256 index) public view returns (string)',
    'function mintFighter(string memory _alienType) public payable returns (uint256)'
  ];

  const nftContract = new ethers.Contract(nftAddress, abi, provider);

  console.log('Reading NFT Contract...');

  try {
    const mintFee = await nftContract.MINT_FEE();
    console.log('MINT_FEE from contract:', ethers.utils.formatEther(mintFee), 'ETH');
    console.log('MINT_FEE in wei:', mintFee.toString());

    // Check if 0.0000001 ETH matches
    const expectedFee = ethers.utils.parseEther('0.0000001');
    console.log('\nExpected fee (0.0000001 ETH):', expectedFee.toString(), 'wei');
    console.log('Match:', mintFee.toString() === expectedFee.toString() ? '✅' : '❌');

    // Try reading alien types
    console.log('\nAvailable alien types:');
    for (let i = 0; i < 6; i++) {
      try {
        const alienType = await nftContract.alienTypes(i);
        console.log(`  ${i}: ${alienType}`);
      } catch (e) {
        break;
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
