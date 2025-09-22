import {
  MetaMaskWallet,
  CoinbaseWallet,
  WalletConnect,
  PhantomWallet,
} from "@thirdweb-dev/wallets";

export const wallets = [
  new MetaMaskWallet({}),
  new CoinbaseWallet({}),
  new WalletConnect({}),
  new PhantomWallet({}),
];
