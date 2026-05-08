const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logicDir = path.join(__dirname, '../logic-engine/src');
const buildScript = path.join(__dirname, '../build-logic.bat');

console.log(`Watching ${logicDir} for changes...`);

let isBuilding = false;
let debounceTimer;

function build() {
  if (isBuilding) return;
  isBuilding = true;
  console.log('--- Rebuilding logic engine ---');
  
  const child = spawn(buildScript, [], { 
    shell: true, 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  child.on('close', (code) => {
    isBuilding = false;
    if (code === 0) {
      console.log('--- Build successful. Watching for changes... ---');
    } else {
      console.log(`--- Build failed with code ${code}. Watching for changes... ---`);
    }
  });
}

// Initial build
build();

// Watch for changes with a simple debounce
fs.watch(logicDir, { recursive: true }, (eventType, filename) => {
  if (filename && filename.endsWith('.rs')) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      build();
    }, 100);
  }
});
