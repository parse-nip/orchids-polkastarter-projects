const solc = require('solc');
const fs = require('fs');
const path = require('path');

function findImports(importPath) {
    if (importPath.startsWith('@openzeppelin/')) {
        const fullPath = path.join(process.cwd(), 'node_modules', importPath);
        if (fs.existsSync(fullPath)) {
            return { contents: fs.readFileSync(fullPath, 'utf8') };
        }
    }
    return { error: 'File not found' };
}

const source = fs.readFileSync('src/ProjectCapital.sol', 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'ProjectCapital.sol': {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode']
            }
        }
    }
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
    let hasError = false;
    output.errors.forEach(err => {
        console.error(err.formattedMessage);
        if (err.severity === 'error') hasError = true;
    });
    if (hasError) process.exit(1);
}

const contract = output.contracts['ProjectCapital.sol']['ProjectCapital'];
const bytecode = '0x' + contract.evm.bytecode.object;
const abi = JSON.stringify(contract.abi, null, 2);

fs.writeFileSync('src/lib/contracts/ProjectCapitalBytecode.ts', `export const PROJECT_CAPITAL_BYTECODE = '${bytecode}';\n`);
fs.writeFileSync('src/lib/contracts/ProjectCapital.ts', `export const PROJECT_CAPITAL_ABI = ${abi} as const;\n`);
console.log('Bytecode and ABI generated successfully');
