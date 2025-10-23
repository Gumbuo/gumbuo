import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { abi } from "./abi"; // Make sure this exists and exports your GMB ABI

const RPC_URL = process.env.RPC_URL!;
const GMB_CONTRACT = process.env.NEXT_PUBLIC_GMB_CONTRACT!;

const client = createPublicClient({
  chain: mainnet,
  transport: http(RPC_URL),
});

export const contract = {
  read: {
    balanceOf: async ([wallet]: [string], options?: { signal?: AbortSignal }) => {
      return await client.readContract({
        address: GMB_CONTRACT as `0x${string}`,
        abi,
        functionName: "balanceOf",
        args: [wallet],
        ...options,
      });
    },
  },
};
