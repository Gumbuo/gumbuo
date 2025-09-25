import { config } from "./config";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

const STORAGE_KEY = "gumbuo_first50";
let first50: string[] = [];

if (typeof window !== "undefined") {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) first50 = JSON.parse(stored);
}

export async function addWallet(address: string) {
  if (first50.includes(address) || first50.length >= 50) return;

  if (config.tokenGatingEnabled) {
    const sdk = new ThirdwebSDK("ethereum");
    const contract = await sdk.getToken("0xYourGumbuoTokenAddress");
    const balance = await contract.balanceOf(address);
    if (balance.value.eq(0)) return;
  }

  first50.push(address);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(first50));
}

export function getWallets() {
  return [...first50];
}

export function clearWallets() {
  first50 = [];
  localStorage.removeItem(STORAGE_KEY);
}
