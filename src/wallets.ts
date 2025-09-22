import {
  coinbaseWallet,
  metamaskWallet,
  walletConnect,
  phantomWallet,
} from "@thirdweb-dev/wallets";

export const wallets = [
  metamaskWallet(),
  coinbaseWallet(),
  walletConnect(),
  phantomWallet(),
];
