# STEM Logic Engine (Rust/Wasm)

This is the core deterministic simulation engine for STEM. It handles variable state, logic execution, and constraint validation.

## Requirements

- [Rust](https://www.rust-lang.org/)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)

## Building

To compile the engine for the browser:

```bash
wasm-pack build --target web
```

## Core Features

1. **State Management**: Maintains a high-performance hash map of current system variables.
2. **Constraint Validation**: Deterministically checks if system rules are satisfied (e.g., `auth.uid == user_id`).
3. **Logic Simulation**: (Work in Progress) Simulates state transitions based on user actions.

## Integration

The compiled Wasm module is designed to be imported by the Next.js frontend to power the "Logic Bot" simulation engine.
