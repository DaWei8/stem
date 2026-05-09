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
