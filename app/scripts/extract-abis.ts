#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

// Contract names to extract ABIs for
const contracts = [
  'Twenty6ixFactory',
  'Twenty6ixNFT', 
  'Twenty6ixPayments'
] as const;

// Paths
const contractsDir = path.join(__dirname, '../../contracts/out');
const outputDir = path.join(__dirname, '../src/contracts');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🔍 Extracting ABIs from compiled contracts...');

contracts.forEach(contractName => {
  try {
    const contractPath = path.join(contractsDir, `${contractName}.sol`, `${contractName}.json`);
    
    if (!fs.existsSync(contractPath)) {
      console.warn(`⚠️  Contract file not found: ${contractPath}`);
      return;
    }

    // Read the compiled contract
    const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    
    // Extract ABI
    const abi = contractData.abi;
    
    if (!abi) {
      console.warn(`⚠️  No ABI found for ${contractName}`);
      return;
    }

    // Write ABI to separate file
    const abiPath = path.join(outputDir, `${contractName}.json`);
    fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
    
    console.log(`✅ Extracted ABI for ${contractName} (${abi.length} functions/events)`);
    
  } catch (error) {
    console.error(`❌ Error extracting ABI for ${contractName}:`, error.message);
  }
});

// Create TypeScript index file for easy imports
const indexContent = `// Auto-generated contract ABIs
${contracts.map(name => 
  `import ${name}ABI from './${name}.json';`
).join('\n')}

export {
${contracts.map(name => `  ${name}ABI`).join(',\n')}
};

export type ContractName = ${contracts.map(name => `'${name}'`).join(' | ')};
`;

fs.writeFileSync(path.join(outputDir, 'index.ts'), indexContent);

console.log('📦 Created contracts index file');
console.log('🎉 ABI extraction complete!');