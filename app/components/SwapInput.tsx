"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { parseEther } from "viem";

const PRESALE_ADDRESS = "0x102078D1b5222562d76E63414c764fC7deedA4E0";
const GMB_PER_ETH = 100000000;
const BASE_CHAIN_ID = "0x2105"; // Base Mainnet

export default function SwapInput() {
  const { address, isConnected } = useAccount();
  const [ethAmount, setEthAmount] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const ethFloat = parseFloat(ethAmount);
  const gmbEstimate = ethFloat
    ? Math.round(ethFloat * GMB_PER_ETH / 100000) * 100000
    : 0;

  const handleBuy = async () => {
    if (ethFloat < 0.001) {
      setErrorMsg("Minimum buy is 0.001 ETH.");
      return;
    }

    try {
      if (!window.ethereum) {
        setErrorMsg("MetaMask not detected.");
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const fromAddress = accounts[0];

      const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
      if (currentChainId !== BASE_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BASE_CHAIN_ID }]
          });
        } catch (switchError) {
          setErrorMsg("Please switch to Base network in MetaMask.");
          return;
        }
      }

      const txParams = {
        from: fromAddress,
        to: PRESALE_ADDRESS,
        value: parseEther(ethAmount).toString(),
        gas: "0x5208", // 21,000
        gasPrice: "0x10C388" // 0.004 Gwei
      };

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [txParams]
      });

      ["nyx", "zorb"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.classList.add("animate");
          setTimeout(() => el.classList.remove("animate"), 8000);
        }
      });

      fetch("/api/logPurchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: fromAddress,
          eth: ethAmount,
          gmb: gmbEstimate,
          txHash: txHash || "unknown",
          timestamp: Date.now()
        })
      });

      setErrorMsg("");
    } catch (err) {
      const error = err as Error;
      setErrorMsg("Transaction failed. Try again or increase ETH amount.");

      fetch("/api/logFailedTx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          eth: ethAmount,
          timestamp: Date.now(),
          reason: error.message || "Unknown failure"
        })
      });
    }
  };

  return (
    <div style={{ marginTop: "2rem", textAlign: "center", fontFamily: "Orbitron, sans-serif", color: "#fff" }}>
      <input
        type="number"
        placeholder="Enter ETH amount"
        value={ethAmount}
        onChange={e => setEthAmount(e.target.value)}
        style={{
          padding: "0.75rem",
          fontSize: "1rem",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "1rem",
          backgroundColor: "#111",
          color: "#0f0"
        }}
      />
      <div style={{ marginBottom: "0.5rem" }}>
        Presale Rate: 1 ETH = {GMB_PER_ETH.toLocaleString()} GMB
      </div>
      <div style={{ marginBottom: "1rem", fontSize: "1.2rem", fontWeight: "bold" }}>
        You’ll receive: {gmbEstimate.toLocaleString()} GMB
      </div>
      {errorMsg && (
        <div style={{ color: "#f00", marginBottom: "1rem" }}>{errorMsg}</div>
      )}
      <button
        onClick={handleBuy}
        disabled={!isConnected || !ethAmount || ethFloat < 0.001}
        style={{
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          backgroundColor: "#0f0",
          color: "#000",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Buy GMB
      </button>
    </div>
  );
}
