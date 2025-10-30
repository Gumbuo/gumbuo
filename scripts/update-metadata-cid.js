const fs = require('fs');
const path = require('path');

// REPLACE THIS with your IPFS CID after uploading images to Pinata
const IMAGE_CID = "bafybeid7kru6e3jrwnbcxslwz73co37zp6fwhbn5qdp6n3rbgzfr2j42jy";

const metadataDir = path.join(__dirname, '../metadata');
const alienTypes = ['nyx', 'zorb', 'baob', 'apelian', 'j3d1', 'zit'];

console.log('🔄 Updating metadata files with IPFS image CID...\n');
console.log('📦 Image CID:', IMAGE_CID);

if (IMAGE_CID === 'YOUR_IMAGE_CID_HERE') {
  console.error('\n❌ ERROR: Please update IMAGE_CID in this script first!');
  console.error('   1. Upload images to Pinata');
  console.error('   2. Copy the IPFS CID (e.g., QmXyZ123...)');
  console.error('   3. Replace YOUR_IMAGE_CID_HERE in this script');
  process.exit(1);
}

alienTypes.forEach(alienType => {
  const filename = `${alienType}.json`;
  const filepath = path.join(metadataDir, filename);
  
  try {
    // Read JSON file
    const metadata = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    // Update image URL
    const extension = alienType === 'j3d1' ? 'jpg' : 'png';
    metadata.image = `ipfs://${IMAGE_CID}/${alienType}.${extension}`;
    
    // Write back
    fs.writeFileSync(filepath, JSON.stringify(metadata, null, 2));
    
    console.log(`✅ Updated ${filename}`);
  } catch (error) {
    console.error(`❌ Failed to update ${filename}:`, error.message);
  }
});

console.log('\n🎉 All metadata files updated!');
console.log('\n📋 Next steps:');
console.log('1. Upload updated metadata folder to Pinata');
console.log('2. Get the metadata CID');
console.log('3. Run: npx hardhat run scripts/update-base-uri.js --network abstractTestnet');
