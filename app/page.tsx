'use client';
import { useState, useEffect } from 'react';
import { ConnectWallet, useAddress, useDisconnect } from '@thirdweb-dev/react';

type PurchaseEntry = {
  walletAddress: string;
  amount: number;
  tokenIn: string;
  tokenOut: string;
  timestamp: string;
};

export default function Page() {
  const address = useAddress();
  const disconnect = useDisconnect();
  const [visitorList, setVisitorList] = useState<string[]>([]);
  const [purchaseList, setPurchaseList] = useState<PurchaseEntry[]>([]);
  const devWallets = [ "0x7FC5205E6DE02e524Bf154Cc9406613262fc7c5b" ];
  const showDevControls = address ? devWallets.includes(address.toLowerCase()) : false;

  useEffect(() => {
    if (address) {
      fetch('/api/visitorList')
        .then(res => res.json())
        .then(data => setVisitorList(data.list || []));
    }
  }, [address]);

  useEffect(() => {
    fetch('/api/logPurchase')
      .then(res => res.json())
      .then(data => setPurchaseList(data.list || []));
  }, []);

  return (
    <>
      {/* Your full JSX tree goes here */}
    </>
  );
}
