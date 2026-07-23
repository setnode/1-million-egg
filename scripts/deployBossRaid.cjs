const hre = require("hardhat");

// Base Sepolia USDC (Circle'ın resmi test USDC'si)
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

async function main() {
  console.log("🐉 Deploying BossRaidManager to Base Sepolia...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    console.error("❌ Deployer has no ETH. Get some from https://www.alchemy.com/faucets/base-sepolia");
    process.exit(1);
  }

  const BossRaidManager = await hre.ethers.getContractFactory("BossRaidManager");
  const bossRaid = await BossRaidManager.deploy(USDC_ADDRESS);
  await bossRaid.waitForDeployment();

  const address = await bossRaid.getAddress();

  console.log("✅ BossRaidManager deployed!");
  console.log("Contract Address:", address);
  console.log("USDC Token:      ", USDC_ADDRESS);
  console.log("Explorer:        ", `https://sepolia.basescan.org/address/${address}`);
  console.log("");
  console.log("📋 Next steps:");
  console.log("1. Add to .env.local:");
  console.log(`   NEXT_PUBLIC_BOSS_RAID_ADDRESS=${address}`);
  console.log(`   NEXT_PUBLIC_OWNER_ADDRESS=${deployer.address}`);
  console.log("");
  console.log("2. Admin panel: http://localhost:3000/admin/boss");
  console.log("   → Approve USDC → Start Raid");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
