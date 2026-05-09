/* @ts-self-types="./logic_engine.d.ts" */
import * as wasm from "./logic_engine_bg.wasm";
import { __wbg_set_wasm } from "./logic_engine_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    LogicEngine
} from "./logic_engine_bg.js";
