"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getElementProperty_1 = __importDefault(require("./getElementProperty"));
const getElementTagName_1 = __importDefault(require("./getElementTagName"));
/**
 * Is Element Selected determines if the referenced element is selected or not.
 * This operation only makes sense on input elements of the Checkbox- and Radio Button states,
 * or option elements.
 *
 * @param browser.isElementSelected
 * @see https://w3c.github.io/webdriver/#dfn-is-element-selected
 * @param {string} elementId  the id of an element returned in a previous call to Find Element(s)
 * @return {boolean}          `true` or `false` based on the selected state.
 */
async function isElementSelected({ elementId }) {
    const tagName = await getElementTagName_1.default.call(this, { elementId });
    const name = tagName === 'option' ? 'selected' : 'checked';
    const isSelected = await getElementProperty_1.default.call(this, { elementId, name });
    return Boolean(isSelected);
}
exports.default = isElementSelected;
