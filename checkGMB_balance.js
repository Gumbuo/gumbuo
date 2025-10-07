const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
const gmbTokenAddress = "0xeA80bCC8DcbD395EAf783DE20fb38903E4B26dc0";
const treasury = "0x7FC5205E6DE02e524Bf154Cc9406613262fc7c5b";

const abi = [
  "function balanceOf(address account) external view returns (uint256)"
];

(async () => {
  const gmb = new ethers.Contract(gmbTokenAddress, abi, provider);
  const balance = await gmb.balanceOf(treasury);
  console.log("🔍 Treasury GMB Balance:", ethers.utils.formatUnits(balance, 18));
})();
