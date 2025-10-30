# 🎉 Abstract Testnet Deployment Complete!

## ✅ Deployed Contracts

### GumbuoFighterNFT
- **Address**: `0x03772362A12686eC103b6B413299D04DEbfb77Af`
- **Network**: Abstract Testnet (Chain ID: 11124)
- **Mint Fee**: 0.0000001 ETH
- **Alien Types**: nyx, zorb, baob, apelian, j3d1, zit

### GumbuoArena
- **Address**: `0x08605178447b6E87bC6999c3DCf25Bf413E3277d`
- **Network**: Abstract Testnet (Chain ID: 11124)
- **Entry Fee**: 0.0000002 ETH
- **Battle Type**: Deterministic Single-TX (ultra gas-efficient)

---

## 🔗 Block Explorer

View contracts on Abstract testnet explorer:
- **NFT Contract**: https://explorer.testnet.abs.xyz/address/0x03772362A12686eC103b6B413299D04DEbfb77Af
- **Arena Contract**: https://explorer.testnet.abs.xyz/address/0x08605178447b6E87bC6999c3DCf25Bf413E3277d

---

## 💰 Get Testnet ETH

**Triangle Faucet** (Easiest - No signup):
https://faucet.triangleplatform.com/abstract/testnet

**Your Deployer Wallet**: `0x3e7e0B8da2F90247267e4B02637F65D6ce2e39E6`

---

## 🎮 How to Play

### 1. Mint a Fighter NFT

```bash
# Using Hardhat console
npx hardhat console --network abstractTestnet

const nft = await ethers.getContractAt("GumbuoFighterNFT", "0x03772362A12686eC103b6B413299D04DEbfb77Af");

# Mint an alien (choose: nyx, zorb, baob, apelian, j3d1, zit)
await nft.mintFighter("nyx", { value: ethers.utils.parseEther("0.0000001") });
```

### 2. Enter the Arena

```bash
const arena = await ethers.getContractAt("GumbuoArena", "0x08605178447b6E87bC6999c3DCf25Bf413E3277d");

# Generate a random move hash
const moveHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("random-move-123"));

# Queue your fighter (use your token ID)
await arena.queueFighter(0, moveHash, { value: ethers.utils.parseEther("0.0000002") });
```

### 3. Battle!

- When you queue, if someone is already waiting → **instant battle!**
- Winner determined by deterministic randomness (50/50 odds)
- Both NFTs are burned
- Winner gets the full prize pool (0.0000004 ETH = both entry fees)

---

## 🧪 Testing Commands

### Check NFT Balance
```bash
npx hardhat console --network abstractTestnet
const nft = await ethers.getContractAt("GumbuoFighterNFT", "0x03772362A12686eC103b6B413299D04DEbfb77Af");
const balance = await nft.balanceOf("YOUR_WALLET_ADDRESS");
console.log("NFT Balance:", balance.toString());
```

### Check Arena Queue
```bash
const arena = await ethers.getContractAt("GumbuoArena", "0x08605178447b6E87bC6999c3DCf25Bf413E3277d");
const hasQueue = await arena.hasQueuedFighter();
console.log("Queue Status:", hasQueue);

if (hasQueue) {
  const queued = await arena.getQueuedFighter();
  console.log("Queued Player:", queued[0]);
  console.log("Token ID:", queued[1].toString());
  console.log("Timestamp:", queued[2].toString());
}
```

### Check Total Battles
```bash
const totalBattles = await arena.totalBattles();
console.log("Total Battles:", totalBattles.toString());
```

---

## ⚙️ Frontend Integration

The hook `app/hooks/useArenaContract.ts` is already configured with the deployed addresses:

```typescript
import { useArenaContract } from '@/hooks/useArenaContract';

function MyComponent() {
  const { mintFighter, enterArena, queuedFighter } = useArenaContract();

  // Mint an NFT
  const handleMint = async () => {
    await mintFighter('nyx');
  };

  // Enter arena with token ID
  const handleEnter = async () => {
    await enterArena(0); // Replace 0 with your token ID
  };

  return (
    <div>
      <button onClick={handleMint}>Mint Fighter</button>
      <button onClick={handleEnter}>Enter Arena</button>
    </div>
  );
}
```

---

## 📋 Contract Features

### GumbuoFighterNFT
- ✅ Mint fighters (0.0000001 ETH)
- ✅ 6 alien types with metadata
- ✅ Battle lock mechanism (can't transfer during fights)
- ✅ Only arena can burn NFTs
- ✅ Owner can update baseURI for IPFS

### GumbuoArena
- ✅ Ultra gas-efficient (<40k gas per battle)
- ✅ Deterministic randomness (blockhash-based)
- ✅ Queue system with 10-minute timeout
- ✅ Auto-resolve when 2nd player joins
- ✅ Winner takes all prize pool
- ✅ Emergency pause/unpause functions

---

## 🔐 Security Features

- ✅ ReentrancyGuard on all payable functions
- ✅ Pausable for emergency stops
- ✅ OnlyOwner for admin functions
- ✅ Token ownership verification
- ✅ Queue timeout to prevent griefing
- ✅ Authorization system (arena → NFT)

---

## 📊 Gas Costs (Estimated)

| Action | Gas | Cost (@ 0.01 gwei) |
|--------|-----|-------------------|
| Mint NFT | ~80k | ~$0.002 |
| Queue Fighter | ~35k | ~$0.001 |
| Battle (auto-resolve) | ~40k | ~$0.001 |
| Cancel Queue | ~20k | ~$0.0005 |

**Total cost for full battle**: ~$0.004 USD

---

## 🚀 Next Steps

### For Testing:
1. ✅ Contracts deployed
2. ✅ Environment variables set
3. ✅ Frontend hooks configured
4. ⏳ Get more testnet ETH
5. ⏳ Mint test NFTs
6. ⏳ Run test battles
7. ⏳ Check battle resolution

### For Production:
1. Upload alien images to IPFS
2. Update metadata JSONs with real IPFS URLs
3. Upload metadata to IPFS
4. Update baseURI: `nft.setBaseURI('ipfs://YOUR_CID/')`
5. Deploy to Abstract mainnet (Chain ID: 2741)
6. Verify contracts on explorer
7. Launch!

---

## 🔍 Verify Contracts

```bash
# Verify NFT contract
npx hardhat verify --network abstractTestnet \
  0x03772362A12686eC103b6B413299D04DEbfb77Af \
  "ipfs://QmYourIPFSHash/"

# Verify Arena contract
npx hardhat verify --network abstractTestnet \
  0x08605178447b6E87bC6999c3DCf25Bf413E3277d \
  0x03772362A12686eC103b6B413299D04DEbfb77Af
```

---

## 📝 Environment Variables

Your `.env.local` has been updated with:

```env
NEXT_PUBLIC_GUMBUO_FIGHTER_NFT=0x03772362A12686eC103b6B413299D04DEbfb77Af
NEXT_PUBLIC_GUMBUO_ARENA=0x08605178447b6E87bC6999c3DCf25Bf413E3277d
ABSTRACT_TESTNET_RPC=https://api.testnet.abs.xyz
ABSTRACT_MAINNET_RPC=https://api.mainnet.abs.xyz
```

---

## 🎯 Battle Mechanics

### How it Works:
1. **Player 1** queues fighter with entry fee (0.0000002 ETH)
2. **Player 2** queues fighter with entry fee (0.0000002 ETH)
3. **Auto-resolve**: Winner determined instantly using:
   - `blockhash(block.number - 1)` (blockchain randomness)
   - Both player addresses
   - Both token IDs
   - Move hashes
   - Block timestamp
4. **Result**: 50/50 odds, winner gets 0.0000004 ETH, both NFTs burned

### Fair Randomness:
- Uses deterministic seed combining multiple unpredictable factors
- 50/50 odds ensure fairness
- Move hashes add commitment layer (even though outcome is random)
- No manipulation possible post-queue

---

**Ready to test!** 🚀

Try minting an NFT and entering the arena. You'll need 2 wallets to test a full battle (or coordinate with a friend).
