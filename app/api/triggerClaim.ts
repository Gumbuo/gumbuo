
export async function triggerClaim(): Promise<number> {
  // Simulate reward logic
  const reward = Math.floor(Math.random() * 1000);
  console.log("Claim triggered. Reward:", reward);
  return reward;
}
