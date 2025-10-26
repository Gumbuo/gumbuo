# Gumbuo Abstract Edition 🛸

This is the **Abstract chain version** of Gumbuo - a fresh deployment optimized for Abstract's fast, low-cost network.

## Key Differences from Base Version

### Chain Configuration
- **Network:** Abstract (Chain ID: 2741)
- **RPC:** https://api.mainnet.abs.xyz
- **Explorer:** https://explorer.abs.xyz

### Economy
- **No GMB Token** - Pure Alien Points (XP) economy
- **Abstract-native** - All transactions on Abstract L2
- **Cheaper gas fees** - Faster and more affordable gameplay
- **Fresh start** - New player economy separate from Base

### Features (Same as Base)
- ✅ Alien Marketplace - Buy and collect aliens
- ✅ Boss Battles - Attack the Mega Gumbuo boss
- ✅ Arena Fights - Pit your aliens against others
- ✅ Staking System - Stake for daily drip rewards
- ✅ Leaderboard - First Timer rankings
- ✅ Global State - All data synced across devices

## Deployment

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your-walletconnect-id>

# Vercel KV (separate database for Abstract version)
KV_URL=<abstract-kv-url>
KV_REST_API_URL=<abstract-kv-rest-api-url>
KV_REST_API_TOKEN=<abstract-kv-rest-api-token>
KV_REST_API_READ_ONLY_TOKEN=<abstract-kv-rest-api-read-only-token>
```

### Deploy to Vercel

1. Create new Vercel project
2. Link to `abstract-edition` branch
3. Add environment variables
4. Deploy!

## Why Abstract?

- 🚀 **Faster transactions** - Sub-second confirmation times
- 💰 **Lower fees** - Make more gameplay affordable
- 🌐 **Modern L2** - Built for gaming and high-frequency dApps
- 🎯 **Fresh economy** - No baggage from previous deployments

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build
npm run build
```

## Migration Notes

This version uses the same codebase as Base Gumbuo but with:
- Abstract chain configuration instead of Base
- Separate Vercel KV database (different player state)
- Updated branding ("Gumbuo Abstract")
- No GMB token integration

Players cannot transfer state between Base and Abstract versions - they are completely independent deployments.
