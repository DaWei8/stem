/* tslint:disable */
/* eslint-disable */

export class LogicEngine {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Evaluates a logical or mathematical expression using the current state.
     * Example: "var_002 == 'test@example.com' && var_004 > 10"
     */
    evaluate(expression: string): any;
    /**
     * Returns the full current state as a JSON string.
     */
    get_state_json(): string;
    /**
     * Retrieves a variable value from the current simulation state.
     */
    get_variable_value(uuid: string): any;
    /**
     * Validates if a variable exists in the registry.
     */
    has_variable(uuid: string): boolean;
    /**
     * Creates a new logic engine with a set of variables and initial state.
     */
    constructor(variables_json: any, state_json: any);
    /**
     * Updates a variable value in the current simulation state.
     */
    set_variable_value(uuid: string, value: any): void;
    /**
     * Validates a list of constraints against the current system state.
     */
    validate_constraints(constraints_json: any): any;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_logicengine_free: (a: number, b: number) => void;
    readonly logicengine_evaluate: (a: number, b: number, c: number) => [number, number, number];
    readonly logicengine_get_state_json: (a: number) => [number, number, number, number];
    readonly logicengine_get_variable_value: (a: number, b: number, c: number) => any;
    readonly logicengine_has_variable: (a: number, b: number, c: number) => number;
    readonly logicengine_new: (a: any, b: any) => [number, number, number];
    readonly logicengine_set_variable_value: (a: number, b: number, c: number, d: any) => [number, number];
    readonly logicengine_validate_constraints: (a: number, b: any) => [number, number, number];
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
