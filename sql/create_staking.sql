CREATE TABLE IF NOT EXISTS staking_pool (
  wallet TEXT PRIMARY KEY,
  stake_time TIMESTAMP DEFAULT now(),
  last_claim TIMESTAMP DEFAULT now(),
  total_claimed BIGINT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);
