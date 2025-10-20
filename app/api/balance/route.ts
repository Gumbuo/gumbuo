export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { Contract } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

const GMB_CONTRACT = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";
const ABI = ["function balanceOf(address owner) view returns (uint256)"];

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet) {
      return new Response(JSON.stringify({ error: "Missing wallet" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Calling balanceOf for:", wallet);

    const provider = new JsonRpcProvider("https://rpc.ankr.com/eth");
    const contract = new Contract(GMB_CONTRACT, ABI, provider);
    const gmbRaw = await contract.balanceOf(wallet);
    const gmb = Number(gmbRaw) / 1e18;

    return new Response(JSON.stringify({ alien: 100, gmb }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Balance API error:", err);
    return new Response(JSON.stringify({ alien: 0, gmb: 0 }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
