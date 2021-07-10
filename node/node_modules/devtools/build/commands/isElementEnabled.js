"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getElementAttribute_1 = __importDefault(require("./getElementAttribute"));
/**
 * Is Element Enabled determines if the referenced element is enabled or not.
 * This operation only makes sense on form controls.
 *
 * @alias browser.isElementEnabled
 * @see https://w3c.github.io/webdriver/#dfn-is-element-enabled
 * @param {string} elementId  the id of an element returned in a previous call to Find Element(s)
 * @return {string}           If the element is in an xml document, or is a disabled form control: `false`, otherwise, `true`.
 */
async function isElementEnabled({ elementId }) {
    const result = await getElementAttribute_1.default.call(this, { elementId, name: 'disabled' });
    return result === null;
}
exports.default = isElementEnabled;
