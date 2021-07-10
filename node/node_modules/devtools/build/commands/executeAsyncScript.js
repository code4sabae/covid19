"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const executeAsyncScript_1 = __importDefault(require("../scripts/executeAsyncScript"));
const utils_1 = require("../utils");
const constants_1 = require("../constants");
/**
 * The Execute Async Script command causes JavaScript to execute as an anonymous function.
 * Unlike the Execute Script command, the result of the function is ignored.
 * Instead an additional argument is provided as the final argument to the function.
 * This is a function that, when called, returns its first argument as the response.
 *
 * @alias browser.executeScript
 * @see https://w3c.github.io/webdriver/#dfn-execute-async-script
 * @param {string} script  a string, the Javascript function body you want executed
 * @param {*[]}    args    an array of JSON values which will be deserialized and passed as arguments to your function
 * @return *               Either the return value of your script, the fulfillment of the Promise returned by your script, or the error which was the reason for your script's returned Promise's rejection.
 */
async function executeAsyncScript({ script, args }) {
    const page = this.getPageHandle(true);
    const scriptTimeout = this.timeouts.get('script') || 0;
    script = script.trim();
    if (script.startsWith('return (')) {
        script = script.slice(7);
    }
    if (script.startsWith('return')) {
        script = `(function () { ${script} }).apply(null, arguments)`;
    }
    const result = await page.$eval('html', executeAsyncScript_1.default, script, scriptTimeout, constants_1.SERIALIZE_PROPERTY, constants_1.SERIALIZE_FLAG, ...(await utils_1.transformExecuteArgs.call(this, args)));
    return utils_1.transformExecuteResult.call(this, page, result);
}
exports.default = executeAsyncScript;
