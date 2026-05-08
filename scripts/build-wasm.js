const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.join(__dirname, '..');
const logicDir = path.join(rootDir, 'logic-engine');
const outputDir = path.join(rootDir, 'frontend/src/lib/wasm');

function build() {
  console.log('--- Starting Logic Engine Build (WASM) ---');
  
  try {
    // Determine if we should use the local exe or system wasm-pack
    const isWindows = process.platform === 'win32';
    const localWasmPack = path.join(rootDir, 'wasm-pack.exe');
    const wasmPackCmd = (isWindows && fs.existsSync(localWasmPack)) ? localWasmPack : 'wasm-pack';

    console.log(`Using command: ${wasmPackCmd}`);

    execSync(`${wasmPackCmd} build --target bundler --out-dir "${outputDir}"`, {
      cwd: logicDir,
      stdio: 'inherit'
    });

    console.log('--- Build Successful ---');
  } catch (error) {
    console.error('--- Build Failed ---');
    console.error('Ensure wasm-pack is installed: https://rustwasm.github.io/wasm-pack/installer/');
    process.exit(1);
  }
}

build();
