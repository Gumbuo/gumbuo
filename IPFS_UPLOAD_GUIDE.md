# 📦 IPFS Upload Guide for Gumbuo Fighter NFTs

## ✅ Metadata Files Created

You now have 6 alien metadata files in `/metadata`:
- nyx.json
- zorb.json
- baob.json
- apelian.json
- j3d1.json
- zit.json

## 🎯 Next: Upload to IPFS

### Option 1: NFT.Storage (EASIEST - Free & Fast)

**Step 1: Sign up**
- Go to https://nft.storage
- Sign up with email
- Get API key

**Step 2: Upload via Web Interface**
1. Click "Upload"
2. Select all 6 metadata JSON files
3. Upload your alien images (nyx.png, zorb.png, etc.)
4. Get IPFS CID (e.g., `bafybei...`)

**Step 3: Update metadata**
- Replace `ipfs://bafkreihtempurl/` in each JSON with your actual CID
- Example: `ipfs://bafybeiabc123/nyx.png`

**Step 4: Re-upload updated JSONs**
- Upload the corrected JSON files
- Get final metadata CID

---

### Option 2: Pinata (Popular Choice)

**Step 1: Sign up**
- Go to https://pinata.cloud
- Free tier: 1GB storage

**Step 2: Upload**
1. Create folder "gumbuo-fighters"
2. Upload all 6 images
3. Upload all 6 JSONs
4. Pin the folder
5. Get folder CID

**Step 3: Use in contract**
```javascript
const baseURI = "ipfs://YOUR_FOLDER_CID/";
// Contract will automatically append "nyx.json", "zorb.json", etc.
```

---

### Option 3: Quick Test (Use placeholder URLs)

**For immediate testing, you can use:**

```javascript
// In deploy script:
const baseURI = "https://raw.githubusercontent.com/your-repo/main/metadata/";
```

This uses GitHub as temporary hosting while you set up IPFS.

---

## 🚀 Quick Deploy (Without IPFS First)

You can deploy NOW and update the baseURI later:

```bash
# 1. Deploy with placeholder
npx hardhat run scripts/deploy-arena.js --network abstractTestnet

# 2. Get testnet ETH
# Visit: https://faucet.testnet.abs.xyz

# 3. Mint test NFTs
# (metadata will show placeholder until you update)

# 4. Later, update baseURI:
npx hardhat console --network abstractTestnet
const nft = await ethers.getContractAt("GumbuoFighterNFT", "0xYourAddress");
await nft.setBaseURI("ipfs://YOUR_REAL_CID/");
```

---

## 📋 Current Metadata Structure

Each alien JSON follows this format:

```json
{
  "name": "Nyx",
  "description": "Master of shadows...",
  "image": "ipfs://CID/nyx.png",
  "attributes": [
    {"trait_type": "Species", "value": "Shadow Walker"},
    {"trait_type": "Type", "value": "nyx"},
    {"trait_type": "Rarity", "value": "Common"},
    {"trait_type": "Element", "value": "Darkness"}
  ]
}
```

---

## ✅ What You Need:

### For Testing (NOW):
- [ ] Get Abstract testnet ETH from faucet
- [ ] Deploy contracts with placeholder baseURI
- [ ] Mint test NFTs
- [ ] Test battles

### For Production (LATER):
- [ ] Upload final alien images to IPFS
- [ ] Update metadata JSONs with real IPFS image URLs
- [ ] Upload metadata JSONs to IPFS
- [ ] Update contract baseURI to point to IPFS
- [ ] Deploy to mainnet

---

## 🎯 Recommended Flow:

1. **Deploy to testnet NOW** with placeholder baseURI
2. **Test minting and battles** (functionality works regardless of metadata)
3. **Upload to IPFS** when you have final images
4. **Update baseURI** on testnet contract
5. **Deploy to mainnet** with correct IPFS baseURI from start

---

---

## 🚀 Step-by-Step: Upload to Pinata (Recommended)

### Step 1: Prepare Files

Your files are already ready:
- **Images**: `/public/` folder (nyx.png, zorb.png, baob.png, apelian.png, j3d1.jpg, zit.png)
- **Metadata**: `/metadata/` folder (nyx.json, zorb.json, baob.json, apelian.json, j3d1.json, zit.json)

### Step 2: Create Pinata Account

1. Go to https://pinata.cloud
2. Sign up (free tier includes 1GB storage)
3. Verify your email

### Step 3: Upload Images First

1. Click **"Upload"** → **"Folder"**
2. Create folder name: `gumbuo-fighters-images`
3. Upload these 6 files from `/public/`:
   - nyx.png
   - zorb.png
   - baob.png
   - apelian.png (or apelian.jpg if that's the one you want)
   - j3d1.jpg
   - zit.png
4. Click **"Upload"**
5. **Copy the IPFS CID** (starts with `Qm...` or `bafybei...`)
   - Example: `QmXyZ123abc...`

### Step 4: Update Metadata Files

Now that you have the image CID, update each JSON file:

**In each metadata JSON file**, replace:
```json
"image": "ipfs://PLACEHOLDER/nyx.png"
```

With:
```json
"image": "ipfs://YOUR_IMAGE_CID/nyx.png"
```

Do this for all 6 JSON files (nyx.json, zorb.json, baob.json, apelian.json, j3d1.json, zit.json).

### Step 5: Upload Updated Metadata

1. Go back to Pinata
2. Click **"Upload"** → **"Folder"**
3. Create folder name: `gumbuo-fighters-metadata`
4. Upload all 6 updated JSON files from `/metadata/`
5. Click **"Upload"**
6. **Copy the IPFS CID** for the metadata folder
   - Example: `QmAbc456def...`

### Step 6: Update Contract Base URI

1. Open `scripts/update-base-uri.js`
2. Find this line:
   ```javascript
   const NEW_BASE_URI = "ipfs://YOUR_IPFS_CID_HERE/";
   ```
3. Replace with your metadata CID:
   ```javascript
   const NEW_BASE_URI = "ipfs://QmAbc456def.../";
   ```
   ⚠️ **Don't forget the trailing slash!**

4. Run the update script:
   ```bash
   npx hardhat run scripts/update-base-uri.js --network abstractTestnet
   ```

### Step 7: Verify It Works

After updating, test the metadata:

1. Mint a test NFT on Abstract testnet
2. Check the token URI on the blockchain explorer
3. Visit the IPFS URL to see the metadata
4. Verify the image loads correctly

---

## 🎯 Quick Commands Summary

```bash
# 1. Update metadata files with IPFS image CID (manual edit)
# Edit metadata/*.json files

# 2. Upload to Pinata (manual via web interface)
# Upload images → Get CID
# Update JSONs with image CID
# Upload JSONs → Get CID

# 3. Update contract
npx hardhat run scripts/update-base-uri.js --network abstractTestnet

# 4. Test mint
npx hardhat console --network abstractTestnet
const nft = await ethers.getContractAt("GumbuoFighterNFT", "0x03772362A12686eC103b6B413299D04DEbfb77Af");
const tx = await nft.mintFighter("nyx", { value: ethers.utils.parseEther("0.0000001") });
await tx.wait();
const uri = await nft.tokenURI(0);
console.log("Token URI:", uri);
```

---

Ready to deploy? Just say "deploy to testnet" and I'll walk you through it! 🚀
