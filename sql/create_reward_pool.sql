CREATE TABLE IF NOT EXISTS reward_pool (
  id SERIAL PRIMARY KEY,
  total_funded BIGINT DEFAULT 0,
  claimed_total BIGINT DEFAULT 0,
  presale_end TIMESTAMP
);
