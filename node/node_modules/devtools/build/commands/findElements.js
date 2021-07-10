"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const utils_1 = require("../utils");
/**
 * The Find Elements command is used to find elements
 * in the current browsing context that can be used for future commands.
 *
 * @alias browser.findElements
 * @see https://w3c.github.io/webdriver/#dfn-find-elements
 * @param {string} using  a valid element location strategy
 * @param {string} value  the actual selector that will be used to find an element
 * @return {object[]}     A (possibly empty) JSON list of representations of an element object.
 */
async function findElements({ using, value }) {
    if (!constants_1.SUPPORTED_SELECTOR_STRATEGIES.includes(using)) {
        throw new Error(`selector strategy "${using}" is not yet supported`);
    }
    if (using === 'link text') {
        using = 'xpath';
        value = `//a[normalize-space() = "${value}"]`;
    }
    else if (using === 'partial link text') {
        using = 'xpath';
        value = `//a[contains(., "${value}")]`;
    }
    else if (using === 'shadow') {
        /**
         * `shadow/<selector>` is the way query-selector-shadow-dom
         * understands to query for shadow elements
         */
        using = 'css';
        value = `shadow/${value}`;
    }
    const page = this.getPageHandle(true);
    return utils_1.findElements.call(this, page, using, value);
}
exports.default = findElements;
