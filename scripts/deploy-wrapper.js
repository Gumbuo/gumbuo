require("ts-node").register();
const { main } = require("./deploy.ts");

main(require("hardhat")).catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
