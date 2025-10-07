const axios = require("axios");

const rpcUrl = "https://mainnet.base.org";
const txHash = "0x8f41f8b887c1d63fd11a1c0c243b830b6dac5a322c02f529c19fab6914781280";

(async () => {
  const res = await axios.post(rpcUrl, {
    jsonrpc: "2.0",
    method: "eth_getTransactionReceipt",
    params: [txHash],
    id: 1
  });

  const receipt = res.data.result;
  if (!receipt || !receipt.contractAddress) {
    console.log("❌ No contract address found. Tx may still be pending or failed.");
    return;
  }

  console.log("✅ Presale contract deployed at:", receipt.contractAddress);
})();
