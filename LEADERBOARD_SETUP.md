# Leaderboard Setup Guide

The leaderboard has been updated to use **Vercel KV** (Redis) for persistent, global storage. This means all users will see the same leaderboard data across all devices and browsers.

## What Changed

### Before
- Used `localStorage` (browser-specific storage)
- Each browser/device had its own separate leaderboard
- Data didn't sync between mobile and desktop
- Users couldn't see each other's registrations

### After
- Uses Vercel KV (Redis database in the cloud)
- All users see the same global leaderboard
- Data syncs across all devices and browsers
- Real-time updates when users register or earn points

## Setup Instructions

### For Local Development

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Link your project to Vercel**:
```bash
vercel link
```

3. **Create a KV database**:
   - Go to your Vercel dashboard: https://vercel.com/dashboard
   - Select your project
   - Go to the "Storage" tab
   - Click "Create Database"
   - Select "KV" (Key-Value Store)
   - Give it a name (e.g., "gumbuo-leaderboard")
   - Click "Create"

4. **Pull environment variables**:
```bash
vercel env pull .env.local
```

This will automatically add the following to your `.env.local`:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

5. **Run the development server**:
```bash
npm run dev
```

### For Production Deployment

The KV database is automatically connected to your Vercel deployment. No additional configuration needed!

1. **Push your code**:
```bash
git add .
git commit -m "Add persistent leaderboard with Vercel KV"
git push
```

2. **Deploy to Vercel**:
```bash
vercel --prod
```

Or simply push to your main branch if you have automatic deployments enabled.

## API Endpoints

### GET /api/leaderboard
Fetch the full leaderboard with all registered wallets.

### POST /api/leaderboard
Register a new wallet on the leaderboard.

**Body**: `{ wallet: "0x...", alienPoints: 1000 }`

### PATCH /api/leaderboard
Update a wallet's alien points.

**Body**: `{ wallet: "0x...", alienPoints: 1500 }`

## Testing

1. Open your app in one browser and connect a wallet
2. Register on the leaderboard
3. Open the app in a different browser or on mobile
4. You should see the same leaderboard with the first wallet registered
5. Connect a different wallet and register
6. Both wallets should appear in the leaderboard across all devices

## Troubleshooting

### "Failed to fetch leaderboard" error
- Make sure Vercel KV is set up in your project
- Check that environment variables are loaded (`.env.local` for development)
- Verify you've run `vercel env pull .env.local`

### Leaderboard shows as empty
- The leaderboard starts fresh when first deployed
- This is normal - users need to register to populate it

### Old localStorage data
- The app no longer uses localStorage for the leaderboard
- Old data won't be migrated automatically
- Users will need to re-register on the new global leaderboard

## Database Structure

The leaderboard is stored in Redis with the key `gumbuo:leaderboard` as an array of entries:

```json
[
  {
    "wallet": "0x1234...",
    "joinedAt": 1234567890,
    "alienPoints": 1000,
    "rank": 1
  },
  {
    "wallet": "0x5678...",
    "joinedAt": 1234567891,
    "alienPoints": 800,
    "rank": 2
  }
]
```

## Cost

Vercel KV is free for:
- Up to 256 MB storage
- Up to 10,000 commands per month

This is more than sufficient for storing 50 wallet entries. Each entry is approximately 150 bytes, so 50 entries = ~7.5 KB total.
