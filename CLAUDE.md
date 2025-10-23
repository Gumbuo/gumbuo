# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gumbuo is a Web3 application built on the Base network that enables users to connect wallets, view token balances (ETH, WETH, GMB token), and track "Alien Points" through a retro-themed alien/UFO UI. The app uses Next.js 13 with the App Router and integrates Wagmi, RainbowKit, and Viem for blockchain interactions.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Environment Variables

Required environment variables (create a `.env.local` file):

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your-walletconnect-project-id>
NEXT_PUBLIC_GMB_CONTRACT=<gumbuo-token-contract-address>
RPC_URL=<mainnet-rpc-url>

# Vercel KV (for production deployment)
KV_URL=<vercel-kv-rest-url>
KV_REST_API_URL=<vercel-kv-rest-api-url>
KV_REST_API_TOKEN=<vercel-kv-rest-api-token>
KV_REST_API_READ_ONLY_TOKEN=<vercel-kv-rest-api-read-only-token>
```

**Note**: Vercel KV environment variables are automatically configured when you create a KV database in your Vercel project dashboard.

## Architecture

### Provider Stack

The app uses a layered provider architecture in `app/components/WagmiWrapper.tsx`:

```
QueryClientProvider (TanStack React Query)
  └── WagmiProvider (Wagmi v2)
      └── RainbowKitProvider (Wallet UI)
          └── AlienPointProvider (Custom context)
              └── {children}
```

**Important**: There are two Wagmi configurations in the codebase:
- `app/wagmi.ts`: Configured for Mainnet + Polygon (used by WagmiWrapper)
- `lib/wagmi.ts`: Configured for Base chain only with RainbowKit defaults (used in lib/Home.tsx)

The dual configuration exists due to active development. The primary provider used by most of the app is `app/components/WagmiWrapper.tsx`.

### Path Aliases

TypeScript paths are configured in `tsconfig.json`:
- `@/*` → `./app/*`
- `@lib/*` → `./lib/*`
- `@public/*` → `./public/*`

### SSR Handling

Wallet-dependent components use `next/dynamic` with `ssr: false` to prevent hydration mismatches. See `app/page.tsx` and `app/hud.tsx` for examples.

### Routing Configuration

`vercel.json` rewrites all routes to `/` except:
- `/api/*` - API routes
- `/hud` - Alternative HUD interface
- Static files (`favicon.ico`, `robots.txt`, `sitemap.xml`)
- Next.js internals (`_next`)

## Blockchain Integration

### Wagmi Hooks

The app uses Wagmi v2 hooks for wallet interactions:
- `useAccount()` - Get connected wallet address and chain
- `useBalance()` - Fetch ETH or ERC20 token balances

### Smart Contract Interaction

GMB token balance reads happen in two ways:

1. **Client-side**: `useBalance()` hook with token address
2. **Server-side**: `/api/balance` route using Viem

The server-side implementation in `app/api/balance/route.ts`:
- Uses Viem's `createPublicClient` for direct contract reads
- Includes a 5-second timeout protection via `AbortSignal`
- Reads from GMB contract using minimal ERC20 ABI (`lib/abi.ts`)

Contract setup in `lib/contract.ts` exports a `contract.read.balanceOf()` wrapper for Viem interactions.

### Chain Configuration

The app primarily targets the **Base network** but includes Mainnet/Polygon support. When adding new contract interactions:
- Server-side contract reads use Mainnet via `RPC_URL` env var
- Client-side wallet connections use Base chain (via `lib/wagmi.ts`)

## State Management

### AlienPointContext

Simple React Context for managing "Alien Points" state:
- Located in `app/context/AlienPointContext.tsx`
- Provides `useAlienPoints()` hook
- Initial value: 100 points

## API Routes

### GET /api/balance

Endpoint: `/api/balance?wallet=0x...`

**Purpose**: Fetch GMB token balance for a wallet address

**Query Parameters**:
- `wallet` (required): Ethereum address (0x...)

**Response**:
```json
{
  "balance": "1000000000000000000", // uint256 raw balance
  "error": "optional error message"
}
```

**Implementation Notes**:
- 5-second timeout to prevent hanging requests
- Uses Viem client with mainnet RPC
- Reads from `NEXT_PUBLIC_GMB_CONTRACT` address

### Leaderboard API

#### GET /api/leaderboard

**Purpose**: Fetch the entire leaderboard with all registered wallets

**Response**:
```json
{
  "success": true,
  "leaderboard": [
    {
      "wallet": "0x...",
      "joinedAt": 1234567890,
      "alienPoints": 1000,
      "rank": 1
    }
  ],
  "spotsRemaining": 48
}
```

#### POST /api/leaderboard

**Purpose**: Register a new wallet on the leaderboard

**Request Body**:
```json
{
  "wallet": "0x...",
  "alienPoints": 1000
}
```

**Response**:
```json
{
  "success": true,
  "entry": {
    "wallet": "0x...",
    "joinedAt": 1234567890,
    "alienPoints": 1000,
    "rank": 1
  },
  "spotsRemaining": 49
}
```

#### PATCH /api/leaderboard

**Purpose**: Update a wallet's alien points

**Request Body**:
```json
{
  "wallet": "0x...",
  "alienPoints": 1500
}
```

**Response**:
```json
{
  "success": true,
  "entry": {
    "wallet": "0x...",
    "joinedAt": 1234567890,
    "alienPoints": 1500,
    "rank": 1
  }
}
```

**Implementation Notes**:
- All leaderboard data is stored in Vercel KV (Redis)
- Supports up to 50 wallets (MAX_FIRST_TIMERS constant)
- Wallet addresses are normalized to lowercase for consistency
- Data is shared globally across all users and devices

## Component Patterns

### Client Components

All components in `app/client/` and `app/components/` are client components (use `"use client"` directive):

- `WalletHUD.tsx` - Displays connected wallet address and ETH/WETH balances
- `HUDBar.tsx` - Video background (`/alien.mp4`) with overlay
- `StatsHUD.tsx` - Displays Alien Points, GMB balance, and pool statistics
- `BuyGumbuo.tsx` - Links to Uniswap/ThirdWeb for purchasing GMB
- `AlienLeaderboard.tsx` - Displays and manages the First Timer Leaderboard with persistent global state

### Dynamic Imports

Use `next/dynamic` for components that depend on wallet connection:

```typescript
const Home = dynamic(() => import("@lib/Home"), { ssr: false });
```

## Styling

The app uses Tailwind CSS v4 with custom theme extensions:

- **Custom colors**: `alienGreen` (#00ff99), `alienPurple` (#8e44ad)
- **Custom font**: "Orbitron" (techno/space theme)
- **z-index utilities**: Custom z-index scale for layering

See `tailwind.config.js` for full configuration.

## Package Management

The project uses npm. Key package resolutions in `package.json`:
- `@metamask/sdk` forced to `>=1.0.0`
- `@react-native-async-storage/async-storage` disabled for browser environment

## Known Architecture Notes

1. **Multiple Provider Implementations**: Several provider files exist (`app/providers.tsx`, `app/components/WagmiClientProvider.tsx`) but the active implementation is `app/components/WagmiWrapper.tsx`

2. **ThirdWeb Dependencies**: ThirdWeb packages are installed but not actively integrated into the provider stack. They're referenced primarily in the BuyGumbuo component for external links.

3. **Unused Components**: `app/client/AlienBalance.tsx` is a minimal placeholder component not actively used in the current UI.

4. **Type Exclusion**: The root layout (`app/layout.tsx`) excludes `bigint` from children props to avoid type conflicts with React serialization.
