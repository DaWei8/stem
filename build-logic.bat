@echo off
echo Building STEM Logic Engine (Wasm)...
set PATH=%PATH%;%USERPROFILE%\.cargo\bin
cd logic-engine
..\wasm-pack.exe build --target bundler --out-dir ../frontend/src/lib/wasm
echo Done.
