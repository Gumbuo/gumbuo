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
    <video autoPlay muted loop id="bg-video">
      <source src="/alien.mp4" type="video/mp4" />
    </video>

    <div style={{
      padding: "2rem",
      maxWidth: "600px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "Orbitron, sans-serif",
      color: "#00ffcc"
    }}>
      <img src="/logo.png" alt="Gumbuo Logo" style={{ width: "120px", marginBottom: "1rem" }} />
      <h2>Gumbuo’s 1st Astral Visitors Airdrop List</h2>

      {address ? (
        <>
          <p>Connected as {address}</p>
          <button
            onClick={disconnect}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#00ffcc",
              color: "#0f0f23",
              border: "none",
              borderRadius: "6px",
              fontFamily: "Orbitron, sans-serif",
              cursor: "pointer"
            }}
          >
            Disconnect Wallet
          </button>
        </>
      ) : (
        <>
          <p>Connect your wallet to enter the mothership.</p>
          <ConnectWallet theme="dark" />
<div style={{
  marginTop: "2rem",
  display: "flex",
  justifyContent: "center"
}}>
  <a
    href="https://thirdweb.com/base/0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      padding: "0.75rem 1.5rem",
      backgroundColor: "#00ffcc",
      color: "#0f0f23",
      border: "none",
      borderRadius: "8px",
      fontFamily: "Orbitron, sans-serif",
      fontWeight: "bold",
      fontSize: "1.2rem",
      cursor: "pointer",
      textDecoration: "none",
      boxShadow: "0 0 12px #00ffcc"
    }}
  >
    🚀 BUY GUMBUO
  </a>
</div>
<div style={{
  marginTop: "2rem",
  display: "flex",
  justifyContent: "center"
}}>
  <a
    href="https://thirdweb.com/base/0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      padding: "0.75rem 1.5rem",
      backgroundColor: "#00ffcc",
      color: "#0f0f23",
      border: "none",
      borderRadius: "8px",
      fontFamily: "Orbitron, sans-serif",
      fontWeight: "bold",
      fontSize: "1.2rem",
      cursor: "pointer",
      textDecoration: "none",
      boxShadow: "0 0 12px #00ffcc"
    }}
  >
    🚀 BUY GUMBUO
  </a>
</div>
        </>
      )}

      {address && (
        <div style={{
          marginTop: "2rem",
          padding: "1rem",
          borderRadius: "12px",
          backgroundColor: "#0f0f23",
          boxShadow: "0 0 20px #00ffcc"
        }}>
          <iframe
            src={`https://thirdweb.com/embed/swap?clientId=f985d3ebee58e34a49d8a57f6410b2ec`}
            style={{ width: "100%", height: "600px", border: "none" }}
            title="SwapWidget"
          />
        </div>
      )}

      <div style={{ marginTop: "2rem", textAlign: "left", width: "100%" }}>
        <h3>🚀 First 50 Astral Visitors</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {visitorList.map((wallet, i) => (
            <li key={wallet}>
              #{i + 1} — {wallet.slice(0, 6)}...{wallet.slice(-4)}
            </li>
          ))}
        </ul>
      </div>

      {showDevControls && (
        <div style={{
          marginTop: "2rem",
          border: "1px solid #00ffcc",
          padding: "1rem"
        }}>
          <p>🛠 Dev Controls Active</p>
        </div>
      )}

      <div style={{
        marginTop: "2rem",
        textAlign: "center"
      }}>
        <p>Join the Gumbuo community:</p>
        <a
          href="https://discord.gg/kbWrjAdqhv"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginRight: "1rem",
            color: "#00ffcc",
            textDecoration: "underline"
          }}
        >
          Discord
        </a>
        <a
          href="https://x.com/gumbuogw3"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#00ffcc",
            textDecoration: "underline"
          }}
        >
          X (Twitter)
        </a>
      </div>

      <div style={{ marginTop: "4rem", textAlign: "left", width: "100%" }}>
        <h3>🪙 Recent Gumbuo Purchases</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {purchaseList.map((entry, i) => (
            <li key={i}>
              #{i + 1} — {entry.walletAddress.slice(0, 6)}...{entry.walletAddress.slice(-4)} swapped {entry.amount} {entry.tokenIn} → {entry.tokenOut} @ {new Date(entry.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  
<div style={{
  marginTop: "2rem",
  display: "flex",
  justifyContent: "center"
}}>
  <div style={{
  marginTop: "2rem",
  display: "flex",
  justifyContent: "flex-start"
}}>
  <a
    href="https://thirdweb.com/base/0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      padding: "0.75rem 1.5rem",
      backgroundColor: "#00ffcc",
      color: "#0f0f23",
      border: "none",
      borderRadius: "8px",
      fontFamily: "Orbitron, sans-serif",
      fontWeight: "bold",
      fontSize: "1.2rem",
      cursor: "pointer",
      textDecoration: "none",
      boxShadow: "0 0 12px #00ffcc"
    }}
  >
    🚀 BUY GUMBUO
  </a>
</div>
</div>
</>
);
}







