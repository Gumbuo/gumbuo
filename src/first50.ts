let first50: string[] = [];

export function addWallet(address: string) {
  if (!first50.includes(address) && first50.length < 50) {
    first50.push(address);
  }
}

export function getWallets() {
  return [...first50];
}

export function clearWallets() {
  first50 = [];
}
