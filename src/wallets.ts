// ✅ Correct
import {
  CoinbaseWallet,
  MetaMaskWallet,
  WalletConnect,
  PhantomWallet,
} from "@thirdweb-dev/wallets";


export const wallets = [
  metamaskWallet(),
  coinbaseWallet(),
  walletConnect(),
  phantomWallet(),
];
