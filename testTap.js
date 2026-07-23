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
    const gas = await client.estimateContractGas({
      address: '0x64631f82EE4c071A6B05382435df3b9eB15f8122',
      abi: ABI,
      functionName: 'tap',
      value: parseEther('0.0000055'),
      account: '0x5a52E96BAcdaBb82fd05763E25335261B270Efcb', // Binance
    });
    console.log('Gas Limit:', gas.toString());
  } catch (err) {
    console.error('Error simulating tap:', err.message);
  }
}
main();
