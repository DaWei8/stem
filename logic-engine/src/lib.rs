use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use evalexpr::*;

/// Represents a variable in the STEM Variable Registry.
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Variable {
    pub registry_uuid: String,
    pub label: String,
    pub value_type: String,
    pub scope: String,
}

/// Operators for logical constraints.
#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum Operator {
    #[serde(rename = "==")]
    Equal,
    #[serde(rename = "!=")]
    NotEqual,
    #[serde(rename = ">")]
    GreaterThan,
    #[serde(rename = "<")]
    LessThan,
    #[serde(rename = "contains")]
    Contains,
    #[serde(rename = "is_null")]
    IsNull,
}

/// A constraint that must be satisfied for a flow to proceed.
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Constraint {
    pub variable_id: String,
    pub operator: Operator,
    pub value: String,
    pub error_message: String,
}

/// The current state of the system during simulation.
#[derive(Serialize, Deserialize, Debug)]
pub struct SystemState {
    pub values: HashMap<String, serde_json::Value>,
}

#[wasm_bindgen]
pub struct LogicEngine {
    state: SystemState,
    variables: Vec<Variable>,
}

#[wasm_bindgen]
impl LogicEngine {
    /// Creates a new logic engine with a set of variables and initial state.
    #[wasm_bindgen(constructor)]
    pub fn new(variables_json: JsValue, state_json: JsValue) -> Result<LogicEngine, JsValue> {
        let variables: Vec<Variable> = serde_wasm_bindgen::from_value(variables_json)?;
        let state: SystemState = serde_wasm_bindgen::from_value(state_json)?;

        Ok(LogicEngine {
            state,
            variables,
        })
    }

    /// Validates if a variable exists in the registry.
    pub fn has_variable(&self, uuid: &str) -> bool {
        self.variables.iter().any(|v| v.registry_uuid == uuid)
    }

    /// Updates a variable value in the current simulation state.
    pub fn set_variable_value(&mut self, uuid: String, value: JsValue) -> Result<(), JsValue> {
        if !self.has_variable(&uuid) {
            return Err(JsValue::from_str(&format!("Variable {} not found in registry", uuid)));
        }

        let val: serde_json::Value = serde_wasm_bindgen::from_value(value)?;
        self.state.values.insert(uuid, val);
        Ok(())
    }

    /// Retrieves a variable value from the current simulation state.
    pub fn get_variable_value(&self, uuid: &str) -> JsValue {
        match self.state.values.get(uuid) {
            Some(val) => serde_wasm_bindgen::to_value(val).unwrap_or(JsValue::NULL),
            None => JsValue::NULL,
        }
    }

    /// Validates a list of constraints against the current system state.
    pub fn validate_constraints(&self, constraints_json: JsValue) -> Result<JsValue, JsValue> {
        let constraints: Vec<Constraint> = serde_wasm_bindgen::from_value(constraints_json)?;
        let mut errors: Vec<String> = Vec::new();

        for constraint in constraints {
            let current_val = self.state.values.get(&constraint.variable_id);
            
            let is_valid = match constraint.operator {
                Operator::IsNull => current_val.is_none() || current_val.unwrap().is_null(),
                Operator::Equal => {
                    if let Some(val) = current_val {
                        val.to_string().replace("\"", "") == constraint.value
                    } else {
                        false
                    }
                }
                _ => true, 
            };

            if !is_valid {
                errors.push(constraint.error_message.clone());
            }
        }

        Ok(serde_wasm_bindgen::to_value(&errors)?)
    }

    /// Evaluates a logical or mathematical expression using the current state.
    /// Example: "var_002 == 'test@example.com' && var_004 > 10"
    pub fn evaluate(&self, expression: &str) -> Result<JsValue, JsValue> {
        let mut context = HashMapContext::new();

        // Inject all current variable values into the evaluation context
        for (uuid, value) in &self.state.values {
            let eval_val = match value {
                serde_json::Value::Number(n) => {
                    if let Some(f) = n.as_f64() {
                        Value::from(f)
                    } else {
                        Value::from(0.0)
                    }
                }
                serde_json::Value::String(s) => Value::from(s.clone()),
                serde_json::Value::Bool(b) => Value::from(*b),
                _ => Value::from(0.0),
            };
            context.set_value(uuid.clone().into(), eval_val).ok();
        }

        // Evaluate the expression using evalexpr
        let result = eval_with_context(expression, &context)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;

        // Convert the result back to JsValue
        let js_result = match result {
            Value::String(s) => JsValue::from_str(&s),
            Value::Float(f) => JsValue::from_f64(f),
            Value::Int(i) => JsValue::from_f64(i as f64),
            Value::Boolean(b) => JsValue::from_bool(b),
            _ => JsValue::NULL,
        };

        Ok(js_result)
    }

    /// Returns the full current state as a JSON string.
    pub fn get_state_json(&self) -> Result<String, JsValue> {
        serde_json::to_string(&self.state)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }
}
