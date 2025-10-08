"use client";

import { useAccount, useConnect, useDisconnect, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { GumbuoPresaleABI } from "../../src/abis/GumbuoPresale";
import type { Abi } from "viem";

const presaleAddress = "0x7264455958060866E69bf5D20e562FfCF7acc204";

export default function BuyButton() {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const ethAmount = "0.01";

  const { writeContract } = useWriteContract();

  const handleBuy = () => {
    writeContract({
      address: presaleAddress,
      abi: GumbuoPresaleABI as unknown as Abi,
      functionName: "buy",
      args: [],
      value: parseEther(ethAmount),
    });
  };

  if (!isConnected) {
    return <button onClick={() => connect({ connector: connectors[0] })}>Connect Wallet</button>;
  }

  return (
    <>
      <button onClick={handleBuy}>Buy GMB</button>
      <button onClick={() => disconnect()}>Disconnect</button>
    </>
  );
}
