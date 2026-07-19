const hre = require("hardhat");

async function main() {
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const usdcToken = await MockERC20.deploy();
  await usdcToken.waitForDeployment();
  console.log("Mock USDC deployed to:", await usdcToken.getAddress());

  const EggClickerV2 = await hre.ethers.getContractFactory("EggClickerV2");
  const eggClicker = await EggClickerV2.deploy(await usdcToken.getAddress());
  await eggClicker.waitForDeployment();
  console.log("EggClickerV2 deployed to:", await eggClicker.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
