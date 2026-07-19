const hre = require("hardhat");

async function main() {
  console.log("Deploying EggClickerV2 to Base Mainnet...");

  // Real USDC Token Address on Base Mainnet
  const BASE_USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  const EggClickerV2 = await hre.ethers.getContractFactory("EggClickerV2");
  
  // Deploy using the real USDC address
  const eggClicker = await EggClickerV2.deploy(BASE_USDC_ADDRESS);
  await eggClicker.waitForDeployment();
  
  const contractAddress = await eggClicker.getAddress();
  console.log("✅ EggClickerV2 successfully deployed to Base Mainnet at:", contractAddress);
  console.log("Now you must update src/constants/contract.ts with this new address!");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
