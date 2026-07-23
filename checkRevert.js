const { createPublicClient, http, parseEther } = require('viem');
const { base } = require('viem/chains');

const client = createPublicClient({
  chain: base,
  transport: http()
});

const ABI = [
  {
    "inputs": [],
    "name": "tap",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

async function main() {
  try {
    const { request } = await client.simulateContract({
      address: '0x64631f82EE4c071A6B05382435df3b9eB15f8122',
      abi: ABI,
      functionName: 'tap',
      value: parseEther('0.0000055'),
      account: '0xDB75D85eb0eb5A2E9F64e565922378BBc59b20b2', // Try an address that has tapped before or the user's address if we knew it
    });
    console.log('Simulate successful');
  } catch (err) {
    console.error('Simulate error:', err.message);
  }
}
main();
