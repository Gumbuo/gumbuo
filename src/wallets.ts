import {
  MetaMaskWallet,
  CoinbaseWallet,
  WalletConnect,
  PhantomWallet,
} from "@thirdweb-dev/wallets";

export const wallets = [
  MetaMaskWallet(),
  CoinbaseWallet(),
  WalletConnect(),
  PhantomWallet(),
];
