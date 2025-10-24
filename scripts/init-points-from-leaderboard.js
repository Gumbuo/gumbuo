// Script to initialize points system from existing leaderboard data
// Run this once after deploying to Vercel

const INITIAL_POOL = {
  totalSupply: 350_000_000,
  wheelPool: 100_000_000,
  faucetPool: 100_000_000,
  reservePool: 150_000_000,
  marketplacePool: 0,
  totalDistributed: 0,
};

// Existing users and their points from leaderboard
const existingUsers = [
  { wallet: "0xb374735CBe89A552421ddb4Aad80380ae40f67a7", points: 5075 }, // 5000 faucet + 75 wheel
  { wallet: "0x7092C339B172a0d13f38926EE8fE1C815663cfc9", points: 100 },  // 100 wheel
  { wallet: "0x6D2861098A1D3487C90Ce8F91060E43B0Edbc1f1", points: 75 },   // 75 wheel
];

async function initializePoints() {
  console.log("🚀 Initializing points system from existing leaderboard...\n");

  // Calculate totals
  const totalPoints = existingUsers.reduce((sum, user) => sum + user.points, 0);

  // Assume: User 1 got 5000 from faucet + 75 from wheel
  // Users 2 and 3 got points from wheel
  const wheelPoints = 75 + 100 + 75; // 250 total from wheel
  const faucetPoints = 5000; // 5000 from faucet

  console.log("📊 Existing Distribution:");
  console.log(`   Wheel distributed: ${wheelPoints.toLocaleString()} AP`);
  console.log(`   Faucet distributed: ${faucetPoints.toLocaleString()} AP`);
  console.log(`   Total distributed: ${totalPoints.toLocaleString()} AP\n`);

  // Create adjusted pool
  const adjustedPool = {
    ...INITIAL_POOL,
    wheelPool: INITIAL_POOL.wheelPool - wheelPoints,
    faucetPool: INITIAL_POOL.faucetPool - faucetPoints,
    totalDistributed: totalPoints,
  };

  console.log("🎯 Adjusted Pool:");
  console.log(`   Wheel Pool: ${adjustedPool.wheelPool.toLocaleString()} / 100,000,000 AP`);
  console.log(`   Faucet Pool: ${adjustedPool.faucetPool.toLocaleString()} / 100,000,000 AP`);
  console.log(`   Reserve Pool: ${adjustedPool.reservePool.toLocaleString()} AP`);
  console.log(`   Marketplace Pool: ${adjustedPool.marketplacePool.toLocaleString()} AP`);
  console.log(`   Total Distributed: ${adjustedPool.totalDistributed.toLocaleString()} AP\n`);

  // Create user balances
  const userBalances = {};
  existingUsers.forEach(user => {
    userBalances[user.wallet.toLowerCase()] = user.points;
  });

  console.log("👥 User Balances:");
  existingUsers.forEach(user => {
    console.log(`   ${user.wallet}: ${user.points.toLocaleString()} AP`);
  });

  // Make API calls to set up the data
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  console.log(`\n🌐 Using API at: ${baseUrl}\n`);

  try {
    // First, reset the pools
    console.log("♻️  Resetting pools...");
    const resetResponse = await fetch(`${baseUrl}/api/points`, {
      method: 'DELETE',
    });
    const resetData = await resetResponse.json();
    console.log("   ✓ Pools reset\n");

    // Now manually set the adjusted pool and balances using POST for each user
    console.log("💾 Setting up user balances...");

    for (const user of existingUsers) {
      // Determine source based on points amount
      // User 1 has 5075 (we'll add 5000 from faucet, then 75 from wheel)
      // Others get their points from wheel

      if (user.points === 5075) {
        // Add 5000 from faucet
        console.log(`   Adding 5000 AP from faucet for ${user.wallet.slice(0, 10)}...`);
        await fetch(`${baseUrl}/api/points`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet: user.wallet,
            points: 5000,
            source: 'faucet'
          }),
        });

        // Add 75 from wheel
        console.log(`   Adding 75 AP from wheel for ${user.wallet.slice(0, 10)}...`);
        await fetch(`${baseUrl}/api/points`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet: user.wallet,
            points: 75,
            source: 'wheel'
          }),
        });
      } else {
        // Add all points from wheel
        console.log(`   Adding ${user.points} AP from wheel for ${user.wallet.slice(0, 10)}...`);
        await fetch(`${baseUrl}/api/points`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet: user.wallet,
            points: user.points,
            source: 'wheel'
          }),
        });
      }
    }

    console.log("\n✅ Initialization complete!\n");

    // Verify the final state
    console.log("🔍 Verifying final state...");
    const verifyResponse = await fetch(`${baseUrl}/api/points`);
    const verifyData = await verifyResponse.json();

    console.log("\n📊 Final Pool State:");
    console.log(`   Wheel Pool: ${verifyData.pool.wheelPool.toLocaleString()} / 100,000,000 AP`);
    console.log(`   Faucet Pool: ${verifyData.pool.faucetPool.toLocaleString()} / 100,000,000 AP`);
    console.log(`   Total Distributed: ${verifyData.pool.totalDistributed.toLocaleString()} AP`);

    console.log("\n✅ All done! Your points system is initialized with existing user data.\n");

  } catch (error) {
    console.error("❌ Error during initialization:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializePoints().catch(console.error);
}

module.exports = { initializePoints };
