CREATE TABLE IF NOT EXISTS presale_buyers (
  wallet TEXT PRIMARY KEY,
  purchase_time TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staking_pool (
  wallet TEXT PRIMARY KEY,
  stake_time TIMESTAMP DEFAULT now(),
  last_claim TIMESTAMP DEFAULT now(),
  total_claimed BIGINT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS reward_pool (
  id SERIAL PRIMARY KEY,
  total_funded BIGINT DEFAULT 0,
  claimed_total BIGINT DEFAULT 0,
  presale_end TIMESTAMP
);
