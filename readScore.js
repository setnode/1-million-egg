const { createPublicClient, http } = require('viem');
const { base } = require('viem/chains');

const client = createPublicClient({
  chain: base,
  transport: http()
});

const ABI = [
  {
    "inputs": [],
    "name": "globalScore",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_SCORE",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function main() {
  const globalScore = await client.readContract({
    address: '0x64631f82EE4c071A6B05382435df3b9eB15f8122',
    abi: ABI,
    functionName: 'globalScore',
  });
  console.log('globalScore:', globalScore.toString());

  const MAX_SCORE = await client.readContract({
    address: '0x64631f82EE4c071A6B05382435df3b9eB15f8122',
    abi: ABI,
    functionName: 'MAX_SCORE',
  });
  console.log('MAX_SCORE:', MAX_SCORE.toString());
}
main();
