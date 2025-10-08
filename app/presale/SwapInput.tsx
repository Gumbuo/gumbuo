"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { GumbuoPresaleABI } from "../../src/abis/GumbuoPresale";
import type { Abi } from "viem";

const presaleAddress = "0x7264455958060866E69bf5D20e562FfCF7acc204";
const rate = 350_000_000n; // GMB per $1000

export default function SwapInput() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();

  const [ethAmount, setEthAmount] = useState("0.01");
  const ethWei = parseEther(ethAmount);
  const gmbRaw = (ethWei * rate) / 10n ** 18n;
  const gmbAmount = gmbRaw.toLocaleString("en-US");

  const handleBuy = () => {
    writeContract({
      address: presaleAddress,
      abi: GumbuoPresaleABI as unknown as Abi,
      functionName: "buy",
      args: [],
      value: ethWei,
    });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem", fontSize: "2rem", color: "white" }}>
      {isConnected && (
        <>
          <p>Connected: {address}</p>
          <input
            type="number"
            step="0.0001"
            min="0"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            style={{ padding: "0.5rem", fontSize: "1.5rem", width: "300px" }}
            placeholder="ETH amount"
          />
          <p>You’ll receive: <strong>{gmbAmount} GMB</strong></p>
          <button onClick={handleBuy}>Buy GMB</button>
        </>
      )}
      {!isConnected && <p>Please connect your wallet to begin.</p>}
    </div>
  );
}
