const { createPublicClient, http, parseAbiItem } = require('viem');
const { baseSepolia } = require('viem/chains');

const CONTRACT_ADDRESS = '0x4A6759d2D0154a9D87868CB70D54C1f1b69F53DE';

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

async function main() {
  const currentBlock = await publicClient.getBlockNumber();
  console.log("Current block:", currentBlock);
  
  try {
    const logs = await publicClient.getLogs({
      address: CONTRACT_ADDRESS,
      event: parseAbiItem('event SeasonEggsUpdated(uint256 indexed season, address indexed player, uint256 newBalance)'),
      args: { season: 0n },
      fromBlock: 0n,
      toBlock: 'latest'
    });
    console.log("Found logs:", logs.length);
  } catch(e) {
    console.error("Error fromBlock 0n:", e.message);
    const fromBlock = currentBlock > 50000n ? currentBlock - 50000n : 0n;
    try {
      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: parseAbiItem('event SeasonEggsUpdated(uint256 indexed season, address indexed player, uint256 newBalance)'),
        args: { season: 0n },
        fromBlock,
        toBlock: 'latest'
      });
      console.log("Found logs with fromBlock", fromBlock, ":", logs.length);
    } catch(e2) {
      console.error("Error fromBlock -50k:", e2.message);
    }
  }
}

main();
