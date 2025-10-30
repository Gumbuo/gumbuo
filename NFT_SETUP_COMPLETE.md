# 🎉 Gumbuo Fighters NFT - Setup Complete!

## ✅ What's Ready

### 1. Metadata Files Created
Location: `/metadata/`
- ✅ nyx.json
- ✅ zorb.json
- ✅ baob.json
- ✅ apelian.json
- ✅ j3d1.json
- ✅ zit.json

### 2. Images Available
Location: `/public/`
- ✅ nyx.png
- ✅ zorb.png
- ✅ baob.png
- ✅ apelian.png
- ✅ j3d1.jpg
- ✅ zit.png

### 3. Smart Contracts Deployed
Network: Abstract Testnet (Chain ID: 11124)
- ✅ NFT Contract: `0x03772362A12686eC103b6B413299D04DEbfb77Af`
- ✅ Arena Contract: `0x08605178447b6E87bC6999c3DCf25Bf413E3277d`

### 4. Helper Scripts Created
- ✅ `scripts/update-metadata-cid.js` - Batch update metadata with image CID
- ✅ `scripts/update-base-uri.js` - Update contract baseURI on-chain

---

## 🚀 Next Steps (To Get Real NFTs Working)

### Step 1: Upload to Pinata (15 minutes)

1. **Go to https://pinata.cloud and sign up**

2. **Upload Images First:**
   - Click "Upload" → "Folder"
   - Name it: `gumbuo-fighters-images`
   - Upload all 6 images from `/public/`
   - Copy the CID (e.g., `QmXyZ123...`)

3. **Update Metadata with Image CID:**
   ```bash
   # Edit scripts/update-metadata-cid.js
   # Replace YOUR_IMAGE_CID_HERE with your actual CID
   
   # Then run:
   node scripts/update-metadata-cid.js
   ```

4. **Upload Updated Metadata:**
   - Go back to Pinata
   - Click "Upload" → "Folder"
   - Name it: `gumbuo-fighters-metadata`
   - Upload all 6 updated JSONs from `/metadata/`
   - Copy the metadata CID (e.g., `QmAbc456...`)

### Step 2: Update Contract (5 minutes)

1. **Edit the update script:**
   ```bash
   # Open scripts/update-base-uri.js
   # Replace YOUR_IPFS_CID_HERE with your metadata CID
   ```

2. **Run the update:**
   ```bash
   npx hardhat run scripts/update-base-uri.js --network abstractTestnet
   ```

### Step 3: Test It (5 minutes)

1. **Mint a test NFT via the UI:**
   - Go to your site: `/abstract`
   - Click "ETH Arena" tab
   - Connect wallet to Abstract Testnet
   - Mint any alien type

2. **Verify metadata:**
   - Check on Abstract testnet explorer
   - View the token URI
   - Confirm IPFS metadata loads
   - Verify image displays

---

## 🎯 Quick Reference

### Contract Addresses
```
NFT:   0x03772362A12686eC103b6B413299D04DEbfb77Af
Arena: 0x08605178447b6E87bC6999c3DCf25Bf413E3277d
```

### Network Info
```
Chain ID: 11124
Name: Abstract Testnet
RPC: https://api.testnet.abs.xyz
Explorer: https://explorer.testnet.abs.xyz
Faucet: https://faucet.testnet.abs.xyz
```

### Costs
```
Mint Fee: 0.0000001 ETH (~$0.0003)
Arena Entry: 0.0000002 ETH (~$0.0006)
Gas: ~$0.005 per transaction
```

---

## 📚 Documentation

- **Detailed IPFS Guide:** `IPFS_UPLOAD_GUIDE.md`
- **Arena Deployment:** `ARENA_DEPLOYMENT.md`
- **Project Overview:** `CLAUDE.md`

---

## 🎮 Current Status

- ✅ Contracts deployed and working
- ✅ Frontend integrated
- ✅ Minting works (with placeholder metadata)
- ✅ Arena battles work
- ⏳ IPFS metadata upload (YOU DO THIS NEXT)
- ⏳ Real NFT images displayed (after IPFS upload)

---

## 💡 Pro Tips

1. **Test First:** Upload to Pinata and update baseURI on testnet before mainnet
2. **Pin Files:** Make sure files are pinned in Pinata (free tier is fine)
3. **Check URLs:** Visit the IPFS URLs directly to verify they load
4. **Backup CIDs:** Save your IPFS CIDs somewhere safe
5. **OpenSea:** Metadata will automatically show on OpenSea-compatible marketplaces

---

## 🆘 Need Help?

**Can't find files?**
```bash
ls metadata/    # Should show 6 JSON files
ls public/*.png # Should show alien images
```

**Wrong network?**
- Make sure you're on Abstract Testnet (chain ID 11124)
- Use the "Add Abstract Testnet" button in the UI

**Mint not working?**
- Get testnet ETH from: https://faucet.testnet.abs.xyz
- Check you have at least 0.001 ETH for gas + mint fee

**Metadata not updating?**
- IPFS can take a few minutes to propagate
- Try different gateways: `https://ipfs.io/ipfs/YOUR_CID`
- Check Pinata dashboard to confirm files are pinned

---

## 🎉 You're Almost There!

Just upload to Pinata and run one script - then you'll have fully functional NFTs with real metadata and images!

**Total time needed: ~25 minutes** ⏱️

Ready? Let's go! 🚀
