const { createPublicClient, http } = require('viem');
const { base } = require('viem/chains');

const client = createPublicClient({
  chain: base,
  transport: http()
});

const ABI = [
  {
    "inputs": [],
    "name": "tapFee",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "dailyClaimFee",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function main() {
  const tapFee = await client.readContract({
    address: '0x64631f82EE4c071A6B05382435df3b9eB15f8122',
    abi: ABI,
    functionName: 'tapFee',
  });
  console.log('Tap Fee:', tapFee.toString());

  const dailyClaimFee = await client.readContract({
    address: '0x64631f82EE4c071A6B05382435df3b9eB15f8122',
    abi: ABI,
    functionName: 'dailyClaimFee',
  });
  console.log('Daily Claim Fee:', dailyClaimFee.toString());
}
main();
