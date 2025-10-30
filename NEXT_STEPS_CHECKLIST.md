# ✅ Next Steps Checklist - Make Your NFTs Real!

## 🎯 Your Mission: Upload to IPFS (25 minutes total)

Follow these steps **in order**:

---

### ☐ Step 1: Sign Up for Pinata (3 min)

1. Go to: https://pinata.cloud
2. Click "Sign Up"
3. Use your email
4. Verify email
5. Log in

---

### ☐ Step 2: Upload Images to Pinata (5 min)

1. Click the **"Upload"** button (top right)
2. Select **"Folder"**
3. Name the folder: `gumbuo-fighters-images`
4. Select these 6 files from your `/public/` folder:
   - [ ] nyx.png
   - [ ] zorb.png
   - [ ] baob.png
   - [ ] apelian.png (or apelian.jpg)
   - [ ] j3d1.jpg
   - [ ] zit.png
5. Click **"Upload"**
6. Wait for upload to complete
7. **COPY THE CID** (looks like `QmXyZ123...` or `bafybei...`)
8. **Paste your image CID here:** `_______________________________`

---

### ☐ Step 3: Update Metadata with Image CID (2 min)

1. Open the file: `scripts/update-metadata-cid.js`
2. Find this line:
   ```javascript
   const IMAGE_CID = "YOUR_IMAGE_CID_HERE";
   ```
3. Replace `YOUR_IMAGE_CID_HERE` with the CID from Step 2
4. Save the file
5. Run this command:
   ```bash
   node scripts/update-metadata-cid.js
   ```
6. You should see "✅ Updated" for all 6 files

---

### ☐ Step 4: Upload Metadata to Pinata (5 min)

1. Go back to Pinata website
2. Click **"Upload"** button again
3. Select **"Folder"**
4. Name the folder: `gumbuo-fighters-metadata`
5. Select these 6 files from your `/metadata/` folder:
   - [ ] nyx.json
   - [ ] zorb.json
   - [ ] baob.json
   - [ ] apelian.json
   - [ ] j3d1.json
   - [ ] zit.json
6. Click **"Upload"**
7. Wait for upload to complete
8. **COPY THE METADATA CID**
9. **Paste your metadata CID here:** `_______________________________`

---

### ☐ Step 5: Update Smart Contract (5 min)

1. Open the file: `scripts/update-base-uri.js`
2. Find this line:
   ```javascript
   const NEW_BASE_URI = "ipfs://YOUR_IPFS_CID_HERE/";
   ```
3. Replace `YOUR_IPFS_CID_HERE` with the **metadata CID** from Step 4
4. **IMPORTANT:** Keep the `ipfs://` prefix and trailing `/`
   - Example: `ipfs://QmAbc123.../`
5. Save the file
6. Run this command:
   ```bash
   npx hardhat run scripts/update-base-uri.js --network abstractTestnet
   ```
7. Wait for transaction to confirm
8. You should see "✅ Base URI updated successfully!"

---

### ☐ Step 6: Test Your NFTs! (5 min)

1. Open your website: http://localhost:3000/abstract
2. Click the **"ETH Arena"** tab
3. Make sure you're connected to **Abstract Testnet**
   - If not, click "Switch to Abstract Testnet"
4. Click **"Mint"** on any alien
5. Confirm the transaction in MetaMask
6. Wait for confirmation
7. Go to Abstract explorer: https://explorer.testnet.abs.xyz
8. Search for your wallet address
9. Find the NFT transaction
10. Click on the NFT
11. View the metadata URL
12. **Verify the image loads!** 🎉

---

## 🎊 Success Criteria

You'll know it worked when:
- ✅ Pinata shows 2 folders uploaded
- ✅ Contract update transaction confirmed
- ✅ NFT metadata displays correctly on explorer
- ✅ Images load from IPFS
- ✅ NFT shows proper name and attributes

---

## 🆘 Troubleshooting

**Problem: "Cannot find module '@pinata/sdk'"**
- Solution: You don't need the SDK! Use Pinata web interface instead

**Problem: "You are not the contract owner"**
- Solution: Make sure you're using the same wallet that deployed the contracts

**Problem: "IPFS image not loading"**
- Solution: IPFS can take 2-5 minutes to propagate. Wait and refresh
- Try alternative gateway: `https://ipfs.io/ipfs/YOUR_CID/nyx.png`

**Problem: "Insufficient funds"**
- Solution: Get testnet ETH from https://faucet.testnet.abs.xyz

---

## 📋 Your CIDs (Save These!)

Once you complete the steps, record your CIDs here:

```
Image CID:    _______________________________________
Metadata CID: _______________________________________
Updated On:   _______________________________________
```

---

## 🚀 What Happens Next?

After completing these steps, your NFTs will:
1. ✅ Display real images on OpenSea-style marketplaces
2. ✅ Show proper metadata (name, traits, description)
3. ✅ Work with any NFT viewer that supports IPFS
4. ✅ Be permanently stored on IPFS (decentralized)
5. ✅ Have proper attributes for rarity tools

---

## 🎯 Ready?

**Estimated time: 25 minutes**

Start with Step 1 and work through each checkbox. You got this! 💪

Questions? Check `IPFS_UPLOAD_GUIDE.md` or `NFT_SETUP_COMPLETE.md` for more details.

**Let's make these NFTs real!** 🚀👽
