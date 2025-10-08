import { writeContract } from "wagmi/actions";
import { ethers } from "ethers";
import { config } from "../../wagmiConfig"; // adjust path if needed

const PRESALE_CONTRACT = "0x102078D1b5222562d76E63414c764fC7deedA4E0";

export async function handleBuy(address: string, ethAmount: string, GumbuoPresaleABI: any) {
  console.log("Buy clicked. ETH:", ethAmount);

  try {
    const tx = await writeContract(
      config,
      {
        address: PRESALE_CONTRACT,
        abi: GumbuoPresaleABI.abi,
        functionName: "buy",
        args: [],
        value: BigInt(ethers.utils.parseEther(ethAmount).toString())
      }
    );

    if (!tx) {
      console.error("Transaction not sent");
      return;
    }

    if (tx && address) {
      await fetch("/api/logPurchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          txHash: tx,
          amount: ethAmount
        })
      });
    }
  } catch (err) {
    console.error("Buy failed:", err);
  }
}

