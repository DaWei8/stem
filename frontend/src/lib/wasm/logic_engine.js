// Mock implementation of the Wasm logic engine
// This file is a placeholder until 'wasm-pack build' is run to generate the real WebAssembly.

export class LogicEngine {
  constructor(variables, state) {
    this.variables = variables;
    this.state = state;
    console.warn("LogicBot: Using MOCK LogicEngine because Wasm module is missing. Run build-logic.bat.");
  }

  evaluate(expression) {
    console.warn("LogicBot: MOCK evaluation of ->", expression);
    return `[Mock Result: ${expression}]`;
  }
}

export default async function init() {
  return Promise.resolve();
}
